import { asc, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import type { Post } from '~/models/posts';
import { decodePostId, PostSchema } from '~/models/posts';
import { posts } from '~/schema';
import type { HonoContext } from '~/types';
import { Order } from '~/utils/order';
import type { Result } from '~/utils/result';
import { ResponseError } from '~/utils/result';

import { verify } from './users';

export async function listPosts(
  c: HonoContext,
  {
    page,
    pageSize,
    order,
  }: {
    page: number;
    pageSize: number;
    order: Order;
  },
): Promise<
  Result<
    { posts: Post[]; total: number },
    typeof ResponseError.InternalServerError
  >
> {
  const db = drizzle(c.env.DB);
  const orderDirection = order === Order.Asc ? asc : desc;

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(posts)
      .orderBy(orderDirection(posts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.$count(posts),
  ]);

  const { success, data } = PostSchema.array().safeParse(rows);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to parse posts',
    };
  }

  return {
    success: true,
    data: {
      posts: data,
      total,
    },
  };
}

export async function getPost(
  c: HonoContext,
  id: string,
): Promise<
  Result<
    Post,
    typeof ResponseError.NotFound | typeof ResponseError.InternalServerError
  >
> {
  const db = drizzle(c.env.DB);

  const postIdResult = decodePostId(id);

  if (!postIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: 'Post not found',
    };
  }

  const postId = postIdResult.data;

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!post) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: 'Post not found',
    };
  }

  const { success, data } = PostSchema.safeParse(post);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to parse post',
    };
  }

  return {
    success: true,
    data,
  };
}

export async function createPost(
  c: HonoContext,
  {
    title,
    content,
  }: {
    title: string;
    content: string;
  },
): Promise<
  Result<
    Post,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);

  if (!userResult.success) {
    return userResult;
  }

  const db = drizzle(c.env.DB);
  const user = userResult.data;

  const [post] = await db
    .insert(posts)
    .values({
      title,
      content,
      authorId: user.id,
    })
    .returning();

  const { success, data } = PostSchema.safeParse(post);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: 'Failed to parse post',
    };
  }

  return {
    success: true,
    data,
  };
}
