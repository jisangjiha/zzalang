import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const postsFts = sqliteTable('posts_content_fts', {
  rowid: integer().notNull().primaryKey(),
  title: text().notNull(),
  content: text().notNull(),
});
