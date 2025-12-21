import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import z from "zod";

import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "~/controller/categories";
import { encodeCategory, CategoryResponseSchema } from "~/models/categories";
import type { HonoEnv } from "~/types";
import { Order } from "~/utils/order";
import { ResponseError } from "~/utils/result";

export default function handleCategories(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: "get",
      path: "/categories",
      summary: "List categories",
      description: "List all categories",
      tags: ["categories"],
      request: {
        query: z.object({
          page: z.coerce.number().default(1),
          pageSize: z.coerce.number().default(10),
          order: z.nativeEnum(Order).default(Order.Desc),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                categories: z.array(CategoryResponseSchema),
                total: z.number(),
              }),
            },
          },
          description: "List of categories",
        },
        [ResponseError.InternalServerError]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      const { page, pageSize, order } = c.req.valid("query");

      const categoriesResult = await listCategories(c, {
        page,
        pageSize,
        order,
      });

      if (!categoriesResult.success) {
        return c.json(
          {
            message: categoriesResult.message,
          },
          categoriesResult.error,
        );
      }

      try {
        const data = categoriesResult.data.categories.map(encodeCategory);
        return c.json(
          {
            categories: data,
            total: categoriesResult.data.total,
          },
          200,
        );
      } catch (error) {
        console.error(error);
        return c.json(
          {
            message: "Failed to parse categories",
          },
          ResponseError.InternalServerError,
        );
      }
    },
  );

  app.openapi(
    createRoute({
      method: "get",
      path: "/categories/{id}",
      summary: "Get a category",
      description: "Get a category by ID",
      tags: ["categories"],
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: CategoryResponseSchema,
            },
          },
          description: "Category details",
        },
        [ResponseError.NotFound]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Category not found",
        },
        [ResponseError.InternalServerError]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const categoryResult = await getCategory(c, id);

      if (!categoryResult.success) {
        return c.json(
          {
            message: categoryResult.message,
          },
          categoryResult.error,
        );
      }

      try {
        const data = encodeCategory(categoryResult.data);
        return c.json(data, 200);
      } catch (error) {
        console.error(error);
        return c.json(
          {
            message: "Failed to parse category",
          },
          ResponseError.InternalServerError,
        );
      }
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/categories",
      summary: "Create a category",
      description: "Create a new category",
      tags: ["categories"],
      security: [{ bearerAuth: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                title: z.string(),
                description: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: CategoryResponseSchema,
            },
          },
          description: "Category created",
        },
        [ResponseError.BadRequest]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Bad request",
        },
        [ResponseError.Unauthorized]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Unauthorized",
        },
        [ResponseError.InternalServerError]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      const { title, description } = c.req.valid("json");

      const categoryResult = await createCategory(c, { title, description });

      if (!categoryResult.success) {
        return c.json(
          {
            message: categoryResult.message,
          },
          categoryResult.error,
        );
      }

      try {
        const data = encodeCategory(categoryResult.data);
        return c.json(data, 200);
      } catch (error) {
        console.error(error);
        return c.json(
          {
            message: "Failed to parse category",
          },
          ResponseError.InternalServerError,
        );
      }
    },
  );

  app.openapi(
    createRoute({
      method: "patch",
      path: "/categories/{id}",
      summary: "Update a category",
      description: "Update a category by ID",
      tags: ["categories"],
      security: [{ bearerAuth: [] }],
      request: {
        params: z.object({
          id: z.string(),
        }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                title: z.string().optional(),
                description: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: CategoryResponseSchema,
            },
          },
          description: "Category updated",
        },
        [ResponseError.BadRequest]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Bad request",
        },
        [ResponseError.Unauthorized]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Unauthorized",
        },
        [ResponseError.NotFound]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Category not found",
        },
        [ResponseError.InternalServerError]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { title, description } = c.req.valid("json");

      const categoryResult = await updateCategory(c, id, {
        title,
        description,
      });

      if (!categoryResult.success) {
        return c.json(
          {
            message: categoryResult.message,
          },
          categoryResult.error,
        );
      }

      try {
        const data = encodeCategory(categoryResult.data);
        return c.json(data, 200);
      } catch (error) {
        console.error(error);
        return c.json(
          {
            message: "Failed to parse category",
          },
          ResponseError.InternalServerError,
        );
      }
    },
  );

  app.openapi(
    createRoute({
      method: "delete",
      path: "/categories/{id}",
      summary: "Delete a category",
      description: "Delete a category by ID",
      tags: ["categories"],
      security: [{ bearerAuth: [] }],
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        204: {
          description: "Category deleted",
        },
        [ResponseError.BadRequest]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Bad request",
        },
        [ResponseError.Unauthorized]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Unauthorized",
        },
        [ResponseError.NotFound]: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().optional(),
              }),
            },
          },
          description: "Category not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const categoryResult = await deleteCategory(c, id);

      if (!categoryResult.success) {
        return c.json(
          {
            message: categoryResult.message,
          },
          categoryResult.error,
        );
      }

      return c.body(null, 204);
    },
  );
}
