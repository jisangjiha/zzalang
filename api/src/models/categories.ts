import z from "zod";

import { decodeId, encodeId } from "~/utils/id";
import type { Result } from "~/utils/result";

const CATEGORIES_KEY = 4;

export const CategorySchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryResponseSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    description: z.string(),
  })
  .openapi("Category");

export function encodeCategoryId(id: number) {
  return encodeId(CATEGORIES_KEY, id);
}

export function decodeCategoryId(id: string): Result<number> {
  return decodeId(CATEGORIES_KEY, id);
}

export const encodeCategory = z
  .function()
  .args(CategorySchema)
  .returns(CategoryResponseSchema)
  .implement((category) => ({
    id: encodeCategoryId(category.id),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    title: category.title,
    description: category.description,
  }));
