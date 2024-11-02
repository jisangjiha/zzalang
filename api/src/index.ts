import { swaggerUI } from '@hono/swagger-ui';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { HonoEnv } from 'types';

const ParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1212121',
    }),
});

const UserSchema = z
  .object({
    id: z.string().openapi({
      example: '123',
    }),
    name: z.string().openapi({
      example: 'John Doe',
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi('User');

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Retrieve the user',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
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
});

const app = new OpenAPIHono<HonoEnv>();
app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

app.openapi(route, (c) => {
  const { id } = c.req.valid('param');
  const token = c.req.header('Authorization');
  if (token === undefined) {
    return c.json(
      {
        message: 'Unauthorized',
      },
      401,
    );
  }
  return c.json(
    {
      id,
      age: 20,
      name: 'John Doe',
    },
    200,
  );
});

app.doc('/doc.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
});

app.get(
  '/',
  swaggerUI({
    url: '/doc.json',
  }),
);

export default app;
