import type { Context } from 'hono';

export interface HonoEnv {
  Bindings: Env;
}

export type HonoContext = Context<HonoEnv>;
