import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bears = pgTable('bears', {
  id: text().primaryKey(),
  name: text().notNull(),
  binomial: text().notNull().unique(),
  image: text('image_url').notNull(),
  range: text().notNull(),
  position: integer().notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable(
  'comments',
  {
    id: uuid().primaryKey().defaultRandom(),
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text().notNull(),
    text: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('comments_bear_created_idx').on(
      table.bearId,
      table.createdAt,
      table.id
    ),
    check('author_length', sql`char_length(${table.author}) between 1 and 80`),
    check('text_length', sql`char_length(${table.text}) between 1 and 2000`),
  ]
);
