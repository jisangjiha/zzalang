import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import z from 'zod';

import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost,
} from '~/controller/posts';
import { encodePost, PostResponseSchema } from '~/models/posts';
import type { HonoEnv } from '~/types';
import { Order } from '~/utils/order';
import { ResponseError } from '~/utils/result';

export default function handlePosts(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/posts',
      summary: 'List posts',
      description: 'List all posts',
      tags: ['posts'],
      request: {
        params: z.object({
          page: z.number().default(1),
          pageSize: z.number().default(10),
          order: z.nativeEnum(Order).default(Order.Desc),
        }),
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                posts: z.array(PostResponseSchema),
                total: z.number(),
              }),
            },
          },
          description: 'List of posts',
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
      const { page, pageSize, order } = c.req.valid('param');

      const postsResult = await listPosts(c, { page, pageSize, order });

      if (!postsResult.success) {
        return c.json(
          {
            message: postsResult.message,
          },
          postsResult.error,
        );
      }

      try {
        const data = postsResult.data.posts.map(encodePost);
        return c.json(
          {
            posts: data,
            total: postsResult.data.total,
          },
          200,
        );
      } catch (error) {
        console.error(error);
        return c.json(
          {
            message: 'Failed to parse posts',
          },
          ResponseError.InternalServerError,
        );
      }
    },
  );

  app.openapi(
    createRoute({
      method: 'get',
      path: '/posts/{id}',
      summary: 'Get post',
      description: 'Get a post by ID',
      tags: ['posts'],
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
              schema: PostResponseSchema,
            },
          },
          description: 'Post found',
        },
        [ResponseError.NotFound]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Post not found',
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
      const { id } = c.req.valid('param');

      const postResult = await getPost(c, id);

      if (!postResult.success) {
        return c.json(
          {
            message: postResult.message,
          },
          postResult.error,
        );
      }

      return c.json(encodePost(postResult.data), 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/posts',
      summary: 'Create post',
      description: 'Create a new post',
      tags: ['posts'],
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                title: z.string(),
                content: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: PostResponseSchema,
            },
          },
          description: 'Post created',
        },
        [ResponseError.BadRequest]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Bad request',
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
      const { title, content } = c.req.valid('json');

      const postResult = await createPost(c, { title, content });

      if (!postResult.success) {
        return c.json(
          {
            message: postResult.message,
          },
          postResult.error,
        );
      }

      return c.json(encodePost(postResult.data), 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'put',
      path: '/posts/{id}',
      summary: 'Update post',
      description: 'Update a post by ID',
      tags: ['posts'],
      request: {
        params: z.object({
          id: z.string().openapi({
            param: {
              name: 'id',
              in: 'path',
            },
          }),
        }),
        body: {
          content: {
            'application/json': {
              schema: z.object({
                title: z.string(),
                content: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: PostResponseSchema,
            },
          },
          description: 'Post updated',
        },
        [ResponseError.NotFound]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Post not found',
        },
        [ResponseError.BadRequest]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Bad request',
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
        [ResponseError.Forbidden]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Forbidden',
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
      const { id } = c.req.valid('param');
      const { title, content } = c.req.valid('json');

      const postResult = await updatePost(c, { id, title, content });

      if (!postResult.success) {
        return c.json(
          {
            message: postResult.message,
          },
          postResult.error,
        );
      }

      return c.json(encodePost(postResult.data), 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'delete',
      path: '/posts/{id}',
      summary: 'Delete post',
      description: 'Delete a post by ID',
      tags: ['posts'],
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
          description: 'Post deleted',
        },
        [ResponseError.NotFound]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Post not found',
        },
        [ResponseError.BadRequest]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Bad request',
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
        [ResponseError.Forbidden]: {
          content: {
            'application/json': {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: 'Forbidden',
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
      const { id } = c.req.valid('param');

      const postResult = await deletePost(c, id);

      if (!postResult.success) {
        return c.json(
          {
            message: postResult.message,
          },
          postResult.error,
        );
      }

      return c.newResponse(null, 200);
    },
  );
}
