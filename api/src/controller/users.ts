import { Buffer } from 'node:buffer';
import { drizzle } from 'drizzle-orm/d1';

import type { User } from '~/models/users';
import { UserSchema } from '~/models/users';
import { users } from '~/schema';
import { hash } from '~/utils/auth';
import type { Result } from '~/utils/result';
import { ResponseError } from '~/utils/result';

const MIN_PASSWORD_LENGTH = 8;
const MIN_HANDLE_LENGTH = 3;
const MIN_NAME_LENGTH = 1;

const ALLOWED_PASSWORD_CHARACTERS = /^[\w!"#$%&'()*+,./:;<=>?@[\\\]^{|}-]*$/u;
const ALLOWED_HANDLE_CHARACTERS = /^[\w-]*$/u;

export async function register(
  env: Env,
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
