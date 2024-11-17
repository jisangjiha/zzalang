import { Buffer } from 'node:buffer';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as jwt from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import z from 'zod';

import type { User } from '~/models/users';
import { decodeUserId, encodeUserId, UserSchema } from '~/models/users';
import { users } from '~/schema';
import type { HonoContext } from '~/types';
import { hash } from '~/utils/auth';
import { createJsonTranscoder } from '~/utils/json';
import type { Result } from '~/utils/result';
import { ResponseError } from '~/utils/result';

const MIN_PASSWORD_LENGTH = 8;
const MIN_HANDLE_LENGTH = 3;
const MIN_NAME_LENGTH = 1;

const ALLOWED_PASSWORD_CHARACTERS = /^[\w!"#$%&'()*+,./:;<=>?@[\\\]^{|}-]*$/u;
const ALLOWED_HANDLE_CHARACTERS = /^[\w-]*$/u;

const TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7;

const TokenSchema = z.object({
  userId: z.number(),
  token: z.string(),
});

const tokenTranscoder = createJsonTranscoder(TokenSchema);

export async function register(
  { env }: HonoContext,
  {
    name,
    handle,
    password,
    passwordConfirmation,
  }: {
    name: string;
    handle: string;
    password: string;
    passwordConfirmation: string;
  },
): Promise<
  Result<
    User,
    typeof ResponseError.BadRequest | typeof ResponseError.InternalServerError
  >
> {
  const passwordValidation = validatePassword({
    name,
    handle,
    password,
    passwordConfirmation,
  });
  if (!passwordValidation.success) {
    return passwordValidation;
  }
  const handleValidation = validateHandle(handle);
  if (!handleValidation.success) {
    return handleValidation;
  }
  const nameValidation = validateName(name);
  if (!nameValidation.success) {
    return nameValidation;
  }

  const passwordHash = await hash({ password, salt: env.PASSWORD_SALT });

  const db = drizzle(env.DB);
  async function insertUser(): Promise<
    Result<
      User,
      typeof ResponseError.BadRequest | typeof ResponseError.InternalServerError
    >
  > {
    try {
      const [user] = await db
        .insert(users)
        .values({
          name,
          handle,
          passwordHash: Buffer.from(passwordHash),
        })
        .returning();
      if (!user) {
        return {
          success: false,
          error: ResponseError.InternalServerError,
          message: 'Failed to create user',
        };
      }
      return { success: true, data: user };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        return {
          success: false,
          error: ResponseError.InternalServerError,
          message: 'Failed to create user',
        };
      }
      const { cause: innerError } = error;
      if (
        innerError instanceof Error &&
        innerError.message ===
          'UNIQUE constraint failed: users.handle: SQLITE_CONSTRAINT'
      ) {
        return {
          success: false,
          error: ResponseError.BadRequest,
          message: 'Handle already exists',
        };
      }
      return {
        success: false,
        error: ResponseError.InternalServerError,
        message: 'Failed to create user',
      };
    }
  }

  const insertUserResult = await insertUser();

  if (!insertUserResult.success) {
    return insertUserResult;
  }

  return { success: true, data: UserSchema.parse(insertUserResult.data) };
}

export async function signIn(
  { env, executionCtx }: HonoContext,
  {
    handle,
    password,
  }: {
    handle: string;
    password: string;
  },
): Promise<
  Result<
    {
      user: User;
      token: string;
    },
    typeof ResponseError.BadRequest | typeof ResponseError.Unauthorized
  >
> {
  const db = drizzle(env.DB);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.handle, handle))
    .execute();

  if (!user) {
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid handle or password',
    };
  }

  const passwordHash = await hash({ password, salt: env.PASSWORD_SALT });

  if (!Buffer.from(passwordHash).equals(Buffer.from(user.passwordHash))) {
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid handle or password',
    };
  }

  const now = Date.now();
  const expiration = now + TOKEN_EXPIRATION;

  const token = await jwt.sign(
    {
      sub: encodeUserId(user.id),
      iat: toSeconds(now),
      exp: toSeconds(expiration),
    },
    env.JWT_SECRET,
  );

  executionCtx.waitUntil(
    env.TOKENS.put(token, tokenTranscoder.encode({ userId: user.id, token }), {
      expiration: toSeconds(expiration),
    }),
  );

  return {
    success: true,
    data: {
      user,
      token,
    },
  };
}

export async function verify(
  c: HonoContext,
): Promise<
  Result<
    User,
    typeof ResponseError.Unauthorized | typeof ResponseError.BadRequest
  >
> {
  async function getValidToken(): Promise<
    Result<z.infer<typeof TokenSchema>, typeof ResponseError.Unauthorized>
  > {
    try {
      const tokenResult = getToken(c);

      if (!tokenResult.success) {
        return tokenResult;
      }

      const validToken = await c.env.TOKENS.get(tokenResult.data);
      if (validToken === null) {
        console.error('Token not found');
        return {
          success: false,
          error: ResponseError.Unauthorized,
          message: 'Invalid token',
        };
      }
      return {
        success: true,
        data: tokenTranscoder.decode(validToken),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to verify token', error);
      }
      return {
        success: false,
        error: ResponseError.Unauthorized,
        message: 'Invalid token',
      };
    }
  }

  const tokenResult = await getValidToken();
  if (!tokenResult.success) {
    return tokenResult;
  }

  const db = drizzle(c.env.DB);
  const verifyResult: Result<JWTPayload, typeof ResponseError.Unauthorized> =
    await jwt.verify(tokenResult.data.token, c.env.JWT_SECRET).then(
      (payload) => ({
        success: true,
        data: payload,
      }),
      (error: unknown) => {
        console.error('Failed to verify token', error);
        return {
          success: false,
          error: ResponseError.Unauthorized,
          message: 'Invalid token',
        };
      },
    );

  if (!verifyResult.success) {
    return verifyResult;
  }

  const { data: payload } = verifyResult;

  if (typeof payload.sub !== 'string') {
    console.error('JWT payload does not contain sub');
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Invalid token',
    };
  }

  const userIdResult = decodeUserId(payload.sub);

  if (
    !userIdResult.success ||
    typeof userIdResult.data !== 'number' ||
    userIdResult.data <= 0
  ) {
    console.error('Invalid user ID', userIdResult);
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Invalid token',
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userIdResult.data))
    .execute();

  if (!user || tokenResult.data.userId !== user.id) {
    console.error('User not found or token does not match', user, tokenResult);
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid token',
    };
  }

  return { success: true, data: user };
}

export async function signOut(
  c: HonoContext,
): Promise<Result<undefined, typeof ResponseError.Unauthorized>> {
  const tokenResult = getToken(c);

  if (!tokenResult.success) {
    return tokenResult;
  }

  return c.env.TOKENS.delete(tokenResult.data).then(
    () => ({ success: true, data: undefined }),
    () => ({
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Failed to sign out',
    }),
  );
}

export async function getUser(
  { env }: HonoContext,
  { userId }: { userId: string },
): Promise<Result<User, typeof ResponseError.NotFound>> {
  const db = drizzle(env.DB);
  const userIdResult = decodeUserId(userId);
  if (!userIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: 'User not found',
    };
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userIdResult.data))
    .execute();
  if (!user) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: 'User not found',
    };
  }
  return { success: true, data: user };
}

export async function updateMyInfo(
  c: HonoContext,
  {
    name,
    handle,
    password,
    passwordConfirmation,
  }: {
    name: string | undefined;
    handle: string | undefined;
    password: string | undefined;
    passwordConfirmation: string | undefined;
  },
): Promise<
  Result<
    User,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);
  if (!userResult.success) {
    return userResult;
  }

  const db = drizzle(c.env.DB);

  const updates: {
    name?: string;
    handle?: string;
    passwordHash?: Buffer;
  } = {};

  if (name !== undefined) {
    const nameValidation = validateName(name);
    if (!nameValidation.success) {
      return nameValidation;
    }
    updates.name = name;
  }

  if (handle !== undefined) {
    const handleValidation = validateHandle(handle);
    if (!handleValidation.success) {
      return handleValidation;
    }
    updates.handle = handle;
  }

  if (password !== undefined) {
    if (passwordConfirmation === undefined) {
      return {
        success: false,
        error: ResponseError.BadRequest,
        message: 'Password confirmation is required',
      };
    }
    const passwordValidation = validatePassword({
      name: userResult.data.name,
      handle: userResult.data.handle,
      password,
      passwordConfirmation,
    });
    if (!passwordValidation.success) {
      return passwordValidation;
    }
    updates.passwordHash = Buffer.from(
      await hash({
        password,
        salt: c.env.PASSWORD_SALT,
      }),
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userResult.data.id))
    .returning();

  if (!updatedUser) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to update user',
    };
  }

  return { success: true, data: UserSchema.parse(updatedUser) };
}

export async function unregister(
  c: HonoContext,
): Promise<
  Result<
    undefined,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);
  if (!userResult.success) {
    return userResult;
  }

  const db = drizzle(c.env.DB);

  const [user] = await db
    .delete(users)
    .where(eq(users.id, userResult.data.id))
    .returning();

  if (!user) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to delete user',
    };
  }

  return { success: true, data: undefined };
}

function validatePassword({
  name,
  handle,
  password,
  passwordConfirmation,
}: {
  name: string;
  handle: string;
  password: string;
  passwordConfirmation: string;
}): Result<undefined, typeof ResponseError.BadRequest> {
  if (!ALLOWED_PASSWORD_CHARACTERS.test(password)) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Password contains invalid characters',
    };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }
  if (password !== passwordConfirmation) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Passwords do not match',
    };
  }
  if (password === handle || password === name) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Password must be different from handle',
    };
  }

  return { success: true, data: undefined };
}

function validateHandle(
  handle: string,
): Result<undefined, typeof ResponseError.BadRequest> {
  if (!ALLOWED_HANDLE_CHARACTERS.test(handle)) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Handle contains invalid characters',
    };
  }
  if (handle.length < MIN_HANDLE_LENGTH) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: `Handle must be at least ${MIN_HANDLE_LENGTH} characters`,
    };
  }
  // Handle cannot consist of only numbers
  if (/^\d+$/u.test(handle)) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Handle must contain letters or special characters',
    };
  }
  // Handle cannot start or end with a hyphen
  if (/^-|-$/u.test(handle)) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Handle cannot start or end with a hyphen',
    };
  }
  return { success: true, data: undefined };
}

function validateName(
  name: string,
): Result<undefined, typeof ResponseError.BadRequest> {
  if (name.length < MIN_NAME_LENGTH) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: `Name must be at least ${MIN_NAME_LENGTH} characters`,
    };
  }
  return { success: true, data: undefined };
}

export function getToken(
  c: HonoContext,
): Result<string, typeof ResponseError.Unauthorized> {
  const bearerToken = c.req.header('Authorization');
  if (bearerToken === undefined) {
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'No token provided',
    };
  }

  const [bearerText, token] = bearerToken.split(' ');

  if (bearerText !== 'Bearer' || token === undefined) {
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid token',
    };
  }

  return {
    success: true,
    data: token,
  };
}

function toSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}
