import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

import handleUsers from './routes/users';
import type { HonoEnv } from './types';

const app = new OpenAPIHono<HonoEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: result.error.errors.map((e) => e.message).join(', '),
        },
        400,
      );
    }
  },
});

app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

handleUsers(app);

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
