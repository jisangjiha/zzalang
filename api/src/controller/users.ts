import { Buffer } from 'node:buffer';
import { drizzle } from 'drizzle-orm/d1';
import z from 'zod';

import { users } from '~/schema';
import { hash } from '~/utils/auth';
import { encodeId } from '~/utils/id';
import type { Result } from '~/utils/result';
import { ResponseError } from '~/utils/result';

export const USERS_KEY = 1;

export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi('User');

export type User = z.infer<typeof UserSchema>;

const MIN_PASSWORD_LENGTH = 8;
const MIN_HANDLE_LENGTH = 3;
const MIN_NAME_LENGTH = 1;

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
): Promise<Result<User>> {
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

  const { success, data, error } = UserSchema.safeParse({
    id: encodeId(USERS_KEY, user.id),
    name,
    handle,
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
}): Result<undefined> {
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

function validateHandle(handle: string): Result<undefined> {
  if (handle.length < MIN_HANDLE_LENGTH) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: `Handle must be at least ${MIN_HANDLE_LENGTH} characters`,
    };
  }
  return { success: true, data: undefined };
}

function validateName(name: string): Result<undefined> {
  if (name.length < MIN_NAME_LENGTH) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: `Name must be at least ${MIN_NAME_LENGTH} characters`,
    };
  }
  return { success: true, data: undefined };
}
