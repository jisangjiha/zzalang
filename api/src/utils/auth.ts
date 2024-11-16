import type { Result } from './result';
import { ResponseError } from './result';

/**
 * Hashes a password with a salt
 */
export async function hash({
  password,
  salt,
}: {
  password: string;
  salt: string;
}): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  return crypto.subtle.digest('SHA-256', data);
}

export function getToken(
  bearer: string,
): Result<string, typeof ResponseError.Unauthorized> {
  const [bearerText, token] = bearer.split(' ');

  if (bearerText !== 'Bearer' || token === undefined) {
    return {
      success: false,
      error: ResponseError.Unauthorized,
      message: 'Invalid token',
    };
  }

  return {
    success: true,
    data: token,
  };
}
