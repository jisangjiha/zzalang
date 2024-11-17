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
