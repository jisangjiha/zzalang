import z from 'zod';

import { encodeId } from '~/utils/id';

const USERS_KEY = 1;

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  handle: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('User');

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