import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { bears, comments } from './schema.js';
import { commentSchema, type Comment } from './comments.js';
import type { BearRepository, CommentRepository } from './repositories.js';

const bearFields = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  image: bears.image,
  range: bears.range,
};

export const bearRepository: BearRepository = {
  async list() {
    return await db
      .select(bearFields)
      .from(bears)
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
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export const commentRepository: CommentRepository = {
  async listByBear(bearId) {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      .orderBy(comments.createdAt, comments.id);
    return rows.map(toComment);
  },
  async create(bearId, input) {
    const [row] = await db
      .insert(comments)
      .values({ bearId, ...input })
      .returning();
    if (row === undefined) throw new Error('Comment insert returned no row.');
    return toComment(row);
  },
  async findById(id) {
    if (!commentSchema.shape.id.safeParse(id).success) return undefined;
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    return row === undefined ? undefined : toComment(row);
  },
  async remove(id) {
    if (!commentSchema.shape.id.safeParse(id).success) return false;
    const result = await db.delete(comments).where(eq(comments.id, id));
    return Boolean(result.rowCount);
  },
};
