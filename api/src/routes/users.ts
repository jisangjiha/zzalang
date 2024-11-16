import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import z from 'zod';

import { register, signIn } from '~/controller/users';
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

  app.openapi(
    createRoute({
      method: 'post',
      path: '/users/sign-in',
      description: 'Sign in',
      tags: ['users'],
      summary: 'Sign in',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                handle: z.string(),
                password: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                user: UserResponseSchema,
                token: z.string(),
              }),
            },
          },
          description: 'Sign in',
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
        [ResponseError.Unauthorized]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Invalid handle or password',
        },
      },
    }),
    async (c) => {
      const { handle, password } = c.req.valid('json');
      const { success, data, error, message } = await signIn(c.env, {
        handle,
        password,
      });

      if (!success) {
        return c.json(
          {
            message,
          },
          error,
        );
      }

      return c.json(
        {
          user: encodeUser(data.user),
          token: data.token,
        },
        200,
      );
    },
  );
}
