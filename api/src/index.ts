import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';

import handleIndex from './routes';
import handleV1App from './routes/v1';
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

app.use('*', cors());

app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

handleIndex(app);
handleV1App(app);

export default app;
