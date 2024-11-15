import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const id = integer().primaryKey({ autoIncrement: true });

const createdAt = integer({
  mode: 'timestamp',
})
  .notNull()
  .default(sql`(unixepoch())`);

const updatedAt = integer({
  mode: 'timestamp',
})
  .$onUpdateFn(() => sql`(unixepoch())`)
  .notNull();

export const users = sqliteTable('users', {
  id: id.notNull(),
  createdAt,
  updatedAt,
  name: text().notNull(),
  email: text().notNull(),
});

export const posts = sqliteTable('posts', {
  id: id.notNull(),
  createdAt,
  updatedAt,
  title: text().notNull(),
  content: text().notNull(),
  authorId: integer()
    .references(() => users.id)
    .notNull(),
});

export const comments = sqliteTable('comments', {
  id: id.notNull(),
  createdAt,
  updatedAt,
  content: text().notNull(),
  postId: integer()
    .references(() => posts.id)
    .notNull(),
  authorId: integer()
    .references(() => users.id)
    .notNull(),
});
