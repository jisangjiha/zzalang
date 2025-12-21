import z from "zod";

import { decodeId, encodeId } from "~/utils/id";
import type { Result } from "~/utils/result";

import { encodeCategoryId } from "./categories";
import { encodeUserId } from "./users";

const POSTS_KEY = 2;
const POSTS_CURSOR_KEY = 3;

export const PostSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
  categoryId: z.number(),
});

export type Post = z.infer<typeof PostSchema>;

export const PostResponseSchema = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    content: z.string(),
    authorId: z.string(),
    categoryId: z.string(),
  })
  .openapi("Post");

export function encodePostId(id: number) {
  return encodeId(POSTS_KEY, id);
}

export function decodePostId(id: string): Result<number> {
  return decodeId(POSTS_KEY, id);
}

export const encodePost = z
  .function()
  .args(PostSchema)
  .returns(PostResponseSchema)
  .implement((post) => ({
    id: encodePostId(post.id),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    title: post.title,
    content: post.content,
    authorId: encodeUserId(post.authorId),
    categoryId: encodeCategoryId(post.categoryId),
  }));

export function encodePostsCursor(id: number) {
  return encodeId(POSTS_CURSOR_KEY, id);
}

export function decodePostsCursor(id: string) {
  return decodeId(POSTS_CURSOR_KEY, id);
}
