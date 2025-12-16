import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import type { Category } from "~/models/categories";
import { CategorySchema, decodeCategoryId } from "~/models/categories";
import { categories } from "~/schema";
import type { HonoContext } from "~/types";
import { Order } from "~/utils/order";
import type { Result } from "~/utils/result";
import { ResponseError } from "~/utils/result";

import { verify } from "./users";

export async function listCategories(
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
    { categories: Category[]; total: number },
    typeof ResponseError.InternalServerError
  >
> {
  const db = drizzle(c.env.DB);
  const orderDirection = order === Order.Asc ? asc : desc;

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(categories)
      .orderBy(orderDirection(categories.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.$count(categories),
  ]);

  const { success, data } = CategorySchema.array().safeParse(rows);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to parse categories",
    };
  }

  return {
    success: true,
    data: {
      categories: data,
      total,
    },
  };
}

export async function getCategory(
  c: HonoContext,
  id: string,
): Promise<Result<Category, typeof ResponseError.NotFound>> {
  const categoryIdResult = decodeCategoryId(id);
  if (!categoryIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Invalid category ID",
    };
  }

  const db = drizzle(c.env.DB);

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryIdResult.data));

  const { success, data } = CategorySchema.safeParse(rows[0]);

  if (!success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Category not found",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function createCategory(
  c: HonoContext,
  { title, description }: { title: string; description: string },
): Promise<
  Result<
    Category,
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

  const rows = await db
    .insert(categories)
    .values({
      title,
      description,
      updatedAt: new Date(),
    })
    .returning();

  const { success, data } = CategorySchema.safeParse(rows[0]);

  if (!success) {
    return {
      success: false,
      error: ResponseError.InternalServerError,
      message: "Failed to create category",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function updateCategory(
  c: HonoContext,
  id: string,
  { title, description }: { title?: string; description?: string },
): Promise<
  Result<
    Category,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.NotFound
    | typeof ResponseError.InternalServerError
  >
> {
  const userResult = await verify(c);

  if (!userResult.success) {
    return userResult;
  }

  const categoryIdResult = decodeCategoryId(id);
  if (!categoryIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Invalid category ID",
    };
  }

  const db = drizzle(c.env.DB);

  const updates: { title?: string; description?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    updates.title = title;
  }

  if (description !== undefined) {
    updates.description = description;
  }

  const rows = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, categoryIdResult.data))
    .returning();

  const { success, data } = CategorySchema.safeParse(rows[0]);

  if (!success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Category not found",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function deleteCategory(
  c: HonoContext,
  id: string,
): Promise<
  Result<
    void,
    | typeof ResponseError.BadRequest
    | typeof ResponseError.Unauthorized
    | typeof ResponseError.NotFound
  >
> {
  const userResult = await verify(c);

  if (!userResult.success) {
    return userResult;
  }

  const categoryIdResult = decodeCategoryId(id);
  if (!categoryIdResult.success) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Invalid category ID",
    };
  }

  // 기본 카테고리(id=1)는 삭제 불가
  if (categoryIdResult.data === 1) {
    return {
      success: false,
      error: ResponseError.BadRequest,
      message: "Cannot delete default category",
    };
  }

  const db = drizzle(c.env.DB);

  const rows = await db
    .delete(categories)
    .where(eq(categories.id, categoryIdResult.data))
    .returning();

  if (rows.length === 0) {
    return {
      success: false,
      error: ResponseError.NotFound,
      message: "Category not found",
    };
  }

  return {
    success: true,
    data: undefined,
  };
}
