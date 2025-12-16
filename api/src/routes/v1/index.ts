import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";

import type { HonoEnv } from "~/types";

import handleCategories from "./categories";
import handlePosts from "./posts";
import handleUsers from "./users";

const PREFIX = "/v1";

export default function handleV1App(app: OpenAPIHono<HonoEnv>) {
  const v1App = app.basePath(PREFIX);

  v1App.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  handleUsers(v1App);
  handlePosts(v1App);
  handleCategories(v1App);

  v1App.doc("/doc.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Board API v1",
    },
  });

  v1App.get(
    "/",
    swaggerUI({
      url: `${PREFIX}/doc.json`,
    }),
  );
}
