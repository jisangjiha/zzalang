import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import z from 'zod';

import { register } from '~/controller/users';
import { encodeUser, UserResponseSchema } from '~/models/users';
import type { HonoEnv } from '~/types';
import { ResponseError } from '~/utils/result';

export default function handleUsers(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: 'post',
      path: '/users',
      description: 'Register a new user',
      tags: ['users'],
      summary: 'Register a new user',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                name: z.string(),
                handle: z.string(),
                password: z.string(),
                passwordConfirmation: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: UserResponseSchema,
            },
          },
          description: 'Register a new user',
        },
        [ResponseError.BadRequest]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Invalid input',
        },
        [ResponseError.InternalServerError]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Internal server error',
        },
      },
    }),
    async (c) => {
      const { name, handle, password, passwordConfirmation } =
        c.req.valid('json');
      const {
        success,
        data: user,
        error,
        message,
      } = await register(c.env, {
        name,
        handle,
        password,
        passwordConfirmation,
      });

      if (!success) {
        return c.json(
          {
            message,
          },
          error,
        );
      }

      return c.json(encodeUser(user), 200);
    },
  );
}
