import { Buffer } from 'node:buffer';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as jose from 'jose';
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

  const user = insertUserResult.data;

  const { success, data, error } = UserSchema.safeParse({
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  });

  if (!success) {
    console.error('Failed to parse user', data, error);

    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to create user',
    };
  }

  return { success: true, data };
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

  const sign = new jose.SignJWT({
    sub: encodeUserId(user.id),
    iat: now,
    exp: expiration,
  });

  const token = await sign
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  executionCtx.waitUntil(
    env.TOKENS.put(token, tokenTranscoder.encode({ userId: user.id }), {
      expiration: expiration / 1000,
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
  env: Env,
  token: string,
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
      const validToken = await env.TOKENS.get(token);
      if (validToken === null) {
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

  const db = drizzle(env.DB);
  const { payload } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(env.JWT_SECRET),
  );

  if (payload.sub === undefined) {
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
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid token',
    };
  }

  return { success: true, data: user };
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
