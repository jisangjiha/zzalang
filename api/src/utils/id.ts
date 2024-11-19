import Sqids from 'sqids';

import { ResponseError } from './result';
import type { Result } from './result';

const sqids = new Sqids({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-',
  minLength: 8,
});

export function encodeId(key: number, id: number): string {
  return sqids.encode([key, id]);
}

export function decodeId(
  key: number,
  encoded: string,
): Result<number, typeof ResponseError.BadRequest> {
  const [sqkey, sqid, ...rest] = sqids.decode(encoded);

  if (rest.length > 0 || sqkey !== key || typeof sqid !== 'number') {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Invalid id',
    };
  }

  return { success: true, data: sqid };
}
