import type z from 'zod';

export function createJsonTranscoder<T extends z.ZodSchema>(schema: T) {
  return {
    encode: (data: z.infer<T>) => JSON.stringify(schema.parse(data)),
    decode: (data: string): z.infer<T> =>
      schema.parse(JSON.parse(data)) as unknown,
  };
}
