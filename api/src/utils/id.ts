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

export function decodeId(encoded: string): Result<[number, number]> {
  const ret = sqids.decode(encoded);

  if (!isTuple<number>(ret) || ret.some((x) => typeof x !== 'number')) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: 'Invalid ID',
    };
  }

  return {
    success: true,
    data: ret,
  };
}

function isTuple<T>(x: unknown): x is [T, T] {
  return Array.isArray(x) && x.length === 2;
}
