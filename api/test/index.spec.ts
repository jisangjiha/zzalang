import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const HOST = 'http://example.com';

describe('Hello World worker', () => {
  it('responds without auth token', async () => {
    const res = await SELF.fetch(`${HOST}/users/123`);
    expect(res.status).toBe(401);
  });
  it('responds with auth token', async () => {
    const id = '123';
    const res = await SELF.fetch(`${HOST}/users/${id}`, {
      headers: {
        Authorization: 'Bearer asdf',
      },
    });
    expect(await res.json()).toMatchObject({
      id,
      name: 'John Doe',
      age: 20,
    });
  });
});
