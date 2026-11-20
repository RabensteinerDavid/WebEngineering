import { makePage } from '../models/pagination.js';
import { and, desc, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { bears, comments } from '../db/schema.js';
import { commentSchema, type Comment } from '../models/comments.js';
import type { BearRepository, CommentRepository } from './interfaces.js';

const lastVisibleRow = -2;
const extraRow = 1;
const bearFields = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  image: bears.image,
  range: bears.range,
};

export const bearRepository: BearRepository = {
  async list(query = '') {
    return await db
      .select(bearFields)
      .from(bears)
      .where(sql`strpos(lower(${bears.name}), lower(${query})) > 0`)
      .orderBy(bears.position, bears.id);
  },
  async findById(id) {
    const [bear] = await db
      .select(bearFields)
      .from(bears)
      .where(eq(bears.id, id));
    return bear;
  },
};

function toComment(row: typeof comments.$inferSelect): Comment {
  const {
    id,
    bearId,
    authorId,
    author,
    text,
    createdAt,
    reportCount,
    hiddenAt,
  } = row;
  return {
    id,
    bearId,
    authorId,
    author,
    text,
    reportCount,
    hiddenAt: hiddenAt?.toISOString() ?? null,
    createdAt: createdAt.toISOString(),
  };
}

export const commentRepository: CommentRepository = {
  async listByBear(bearId, limit, cursor) {
    // Preserve PostgreSQL microseconds in the cursor; JavaScript Date only stores milliseconds.
    const rows = await db
      .select({
        ...getTableColumns(comments),
        cursorTime: sql<string>`to_char(${comments.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
      })
      .from(comments)
      .where(
        and(
          eq(comments.bearId, bearId),
          isNull(comments.hiddenAt),
          cursor === undefined
            ? undefined
            : sql`(${comments.createdAt}, ${comments.id}) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`
        )
      )
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .limit(limit + extraRow);
    return makePage(
      rows.map(toComment),
      limit,
      rows.at(lastVisibleRow)?.cursorTime
    );
  },
  async create(bearId, input, authorId) {
    const [row] = await db
      .insert(comments)
      .values({ bearId, ...input, authorId: authorId ?? null })
      .returning();
    if (row === undefined) throw new Error('Comment insert returned no row.');
    return toComment(row);
  },
  async findById(id) {
    if (!commentSchema.shape.id.safeParse(id).success) return undefined;
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    return row === undefined ? undefined : toComment(row);
  },
  async incrementReports(id, hideAt) {
    if (!commentSchema.shape.id.safeParse(id).success) return undefined;
    const nextCount = sql`${comments.reportCount} + 1`;
    const [row] = await db
      .update(comments)
      .set({
        reportCount: nextCount,
        hiddenAt: sql`CASE WHEN ${nextCount} >= ${hideAt} THEN coalesce(${comments.hiddenAt}, now()) ELSE ${comments.hiddenAt} END`,
      })
      .where(eq(comments.id, id))
      .returning();
    return row === undefined ? undefined : toComment(row);
  },
  async remove(id, actor) {
    if (!commentSchema.shape.id.safeParse(id).success) return false;
    const result = await db
      .delete(comments)
      .where(
        and(
          eq(comments.id, id),
          actor === undefined || actor.role === 'moderator'
            ? undefined
            : eq(comments.authorId, actor.id)
        )
      );
    return Boolean(result.rowCount);
  },
};
