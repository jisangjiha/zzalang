import type { OpenAPIHono } from '@hono/zod-openapi';

import type { HonoEnv } from '~/types';

export default function handleIndex(app: OpenAPIHono<HonoEnv>) {
  app.get('/', async (c) =>
    c.html(
      <html>
        <head>
          <title>Board API</title>
        </head>
        <body>
          <h1>Board API</h1>
          <ul>
            <li>
              <a href="/v1">v1 API</a>
            </li>
          </ul>
        </body>
      </html>,
    ),
  );
}
