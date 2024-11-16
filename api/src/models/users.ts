import z from 'zod';

import { decodeId, encodeId } from '~/utils/id';
import type { Result } from '~/utils/result';

const USERS_KEY = 1;

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  handle: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const UserResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('User');

export function encodeUserId(id: number) {
  return encodeId(USERS_KEY, id);
}

export function decodeUserId(id: string): Result<number> {
  return decodeId(USERS_KEY, id);
}

export const encodeUser = z
  .function()
  .args(UserSchema)
  .returns(UserResponseSchema)
  .implement((user) => ({
    id: encodeId(USERS_KEY, user.id),
    name: user.name,
    handle: user.handle,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
