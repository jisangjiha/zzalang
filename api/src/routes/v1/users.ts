import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import z from 'zod';

import {
  getUser,
  register,
  signIn,
  signOut,
  unregister,
  updateMyInfo,
  verify,
} from '~/controller/users';
import { encodeUser, UserResponseSchema } from '~/models/users';
import type { HonoEnv } from '~/types';
import { ResponseError } from '~/utils/result';

export default function handleUsers(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: 'post',
      path: '/register',
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
      } = await register(c, {
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
      path: '/unregister',
      description: 'Unregister the current user',
      tags: ['users'],
      summary: 'Unregister the current user',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
          description: 'Unregister the current user',
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
          description: 'Unauthorized',
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
      security: [
        {
          bearerAuth: [],
        },
      ],
    }),
    async (c) => {
      const { success, error, message } = await unregister(c);

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
          message: 'Unregistered',
        },
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/sign-in',
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
      const { success, data, error, message } = await signIn(c, {
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

  app.openapi(
    createRoute({
      method: 'post',
      path: '/sign-out',
      description: 'Sign out',
      tags: ['users'],
      summary: 'Sign out',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
          description: 'Sign out',
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
          description: 'Unauthorized',
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    }),
    async (c) => {
      const { success, error, message } = await signOut(c);

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
          message: 'Signed out',
        },
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: 'get',
      path: '/me',
      description: 'Retrieve the current user',
      tags: ['users'],
      summary: 'Retrieve the current user',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: UserResponseSchema,
            },
          },
          description: 'Retrieve the current user',
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
          description: 'Unauthorized',
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    }),
    async (c) => {
      const { success, data, error, message } = await verify(c);

      if (!success) {
        return c.json(
          {
            message,
          },
          error,
        );
      }

      return c.json(encodeUser(data), 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'patch',
      path: '/me',
      description: 'Update the current user',
      tags: ['users'],
      summary: 'Update the current user',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                name: z.string().optional(),
                handle: z.string().optional(),
                password: z.string().optional(),
                passwordConfirmation: z.string().optional(),
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
          description: 'Update the current user',
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
          description: 'Unauthorized',
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
      security: [
        {
          bearerAuth: [],
        },
      ],
    }),
    async (c) => {
      const { name, handle, password, passwordConfirmation } =
        c.req.valid('json');
      const { success, data, error, message } = await updateMyInfo(c, {
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

      return c.json(encodeUser(data), 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'get',
      path: '/users/{id}',
      description: 'Retrieve a user by ID',
      tags: ['users'],
      summary: 'Retrieve a user by ID',
      request: {
        params: z.object({
          id: z.string().openapi({
            param: {
              name: 'id',
              in: 'path',
            },
          }),
        }),
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: UserResponseSchema,
            },
          },
          description: 'Retrieve the user',
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'User not found',
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const { success, data, error, message } = await getUser(c, {
        userId: id,
      });

      if (!success) {
        return c.json(
          {
            message,
          },
          error,
        );
      }

      return c.json(encodeUser(data), 200);
    },
  );
}
