// Deliberately unsafe example for the lost-update experiment.
import { eq } from 'drizzle-orm';
import { db } from '../src/db/client.ts';
import { comments } from '../src/db/schema.ts';
import { commentRepository } from '../src/repositories/postgres-repositories.ts';

export const naiveRepository = {
  ...commentRepository,
  async incrementReports(id, hideAt) {
    const comment = await commentRepository.findById(id);
    if (!comment) return undefined;
    const reportCount = comment.reportCount + 1;
    await db
      .update(comments)
      .set({
        reportCount,
        hiddenAt: comment.hiddenAt
          ? new Date(comment.hiddenAt)
          : reportCount >= hideAt
            ? new Date()
            : null,
      })
      .where(eq(comments.id, id));
    return commentRepository.findById(id);
  },
};
