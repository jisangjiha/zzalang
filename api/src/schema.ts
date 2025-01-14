import { sql } from 'drizzle-orm';
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const id = integer().primaryKey({ autoIncrement: true });

const createdAt = integer({
  mode: 'timestamp',
})
  .notNull()
  .default(sql`(unixepoch())`);

const updatedAt = integer({
  mode: 'timestamp',
})
  .$onUpdateFn(() => new Date())
  .notNull();

export const users = sqliteTable('users', {
  id: id.notNull(),
  createdAt,
  updatedAt,
  name: text().notNull(),
  handle: text().notNull().unique(),
  passwordHash: blob({ mode: 'buffer' }).notNull(),
});

export const posts = sqliteTable(
  'posts',
  {
    id: id.notNull(),
    createdAt,
    updatedAt,
    title: text().notNull(),
    content: text().notNull(),
    authorId: integer()
      .references(() => users.id)
      .notNull(),
  },
  (table) => ({
    createdAtIndex: index('created_at_index').on(table.createdAt),
    authorIndex: index('author_index').on(table.authorId),
  }),
);

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
