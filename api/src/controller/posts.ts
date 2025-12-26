import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { decodeCategoryId } from "~/models/categories";
import type { Post } from "~/models/posts";
import { decodePostId, PostSchema } from "~/models/posts";
import { posts } from "~/schema";
import type { HonoContext } from "~/types";
import { Order } from "~/utils/order";
import type { Result } from "~/utils/result";
import { ResponseError } from "~/utils/result";
import { postsFts } from "~/virtual-schemas";

import { verify } from "./users";

export async function listPosts(
  c: HonoContext,
  {
    page,
    pageSize,
    order,
    categoryId,
  }: {
    page: number;
    pageSize: number;
    order: Order;
    categoryId?: string;
  },
): Promise<
  Result<
    { posts: Post[]; total: number },
    typeof ResponseError.InternalServerError
  >
> {
  const db = drizzle(c.env.DB);
  const orderDirection = order === Order.Asc ? asc : desc;

  let whereCondition;
  if (categoryId !== undefined) {
    const categoryIdResult = decodeCategoryId(categoryId);
    if (categoryIdResult.success) {
      whereCondition = eq(posts.categoryId, categoryIdResult.data);
    }
  }

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(whereCondition)
      .orderBy(orderDirection(posts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    whereCondition ? db.$count(posts, whereCondition) : db.$count(posts),
  ]);

  const { success, data } = PostSchema.array().safeParse(rows);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to parse posts",
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
      message: "Post not found",
    };
  }

  const postId = postIdResult.data;

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!post) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Post not found",
    };
  }

  const { success, data } = PostSchema.safeParse(post);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to parse post",
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
    categoryId,
  }: {
    title: string;
    content: string;
    categoryId: string;
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

  const categoryIdResult = decodeCategoryId(categoryId);

  if (!categoryIdResult.success) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: "Invalid category ID",
    };
  }

  const db = drizzle(c.env.DB);
  const user = userResult.data;

  const [post] = await db
    .insert(posts)
    .values({
      title,
      content,
      authorId: user.id,
      categoryId: categoryIdResult.data,
      updatedAt: new Date(),
    })
    .returning();

  const { success, data } = PostSchema.safeParse(post);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to parse post",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function updatePost(
  c: HonoContext,
  {
    id,
    title,
    content,
    categoryId,
  }: {
    id: string;
    title?: string;
    content?: string;
    categoryId?: string;
  },
): Promise<
  Result<
    Post,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.Forbidden
    | typeof ResponseError.NotFound
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);

  if (!userResult.success) {
    return userResult;
  }

  const db = drizzle(c.env.DB);
  const user = userResult.data;

  const postIdResult = decodePostId(id);

  if (!postIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Post not found",
    };
  }

  const postId = postIdResult.data;

  // Check is the author of the post
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!post) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Post not found",
    };
  }

  if (post.authorId !== user.id) {
    return {
      success: false,
      error: ResponseError.Forbidden,
      message: "Forbidden",
    };
  }

  const updates: {
    title?: string;
    content?: string;
    categoryId?: number;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    updates.title = title;
  }

  if (content !== undefined) {
    updates.content = content;
  }

  if (categoryId !== undefined) {
    const categoryIdResult = decodeCategoryId(categoryId);

    if (!categoryIdResult.success) {
      return {
        success: false,
        error: ResponseError.BadRequest,
        message: "Invalid category ID",
      };
    }

    updates.categoryId = categoryIdResult.data;
  }

  const [updatedPost] = await db
    .update(posts)
    .set(updates)
    .where(eq(posts.id, postId))
    .returning();

  const { success, data } = PostSchema.safeParse(updatedPost);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to parse post",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function deletePost(
  c: HonoContext,
  id: string,
): Promise<
  Result<
    void,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.Forbidden
    | typeof ResponseError.NotFound
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);

  if (!userResult.success) {
    return userResult;
  }

  const db = drizzle(c.env.DB);
  const user = userResult.data;

  const postIdResult = decodePostId(id);

  if (!postIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Post not found",
    };
  }

  const postId = postIdResult.data;

  // Check is the author of the post
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));

  if (!post) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Post not found",
    };
  }

  if (post.authorId !== user.id) {
    return {
      success: false,
      error: ResponseError.Forbidden,
      message: "Forbidden",
    };
  }

  await db.delete(posts).where(eq(posts.id, postId));

  return {
    success: true,
    data: undefined,
  };
}

export async function searchPosts(
  c: HonoContext,
  {
    query,
    cursor,
    pageSize,
    order,
  }: {
    query: string;
    cursor: number | null;
    pageSize: number;
    order: Order;
  },
): Promise<
  Result<
    {
      posts: Post[];
      cursor: number | null;
      hasMore: boolean;
    },
    typeof ResponseError.BadRequest
  >
> {
  const db = drizzle(c.env.DB);

  const searchQuery = sql`posts_content_fts MATCH ${`"${query}"`}`;
  const orderDirection = order === Order.Asc ? asc : desc;

  const postsSearchSubQuery = db.$with("posts_search").as(
    db
      .select({
        rowid: postsFts.rowid,
      })
      .from(postsFts)
      .orderBy(orderDirection(postsFts.rowid))
      .where(
        cursor === null
          ? searchQuery
          : and(gt(postsFts.rowid, cursor), searchQuery),
      )
      .limit(
        // Fetch one more than the page size to determine if there are more
        pageSize + 1,
      ),
  );

  const postsSearchResult = await db
    .with(postsSearchSubQuery)
    .select()
    .from(posts)
    .innerJoin(postsSearchSubQuery, eq(posts.id, postsSearchSubQuery.rowid));

  const hasMore = postsSearchResult.length > pageSize;

  const slicedPosts = postsSearchResult.slice(0, pageSize);

  const postList = slicedPosts.map(({ posts: post }) => post);
  const newCursor = hasMore
    ? (slicedPosts.at(-1)?.posts_search.rowid ?? null)
    : null;

  return {
    success: true,
    data: {
      posts: postList,
      cursor: newCursor,
      hasMore,
    },
  };
}
