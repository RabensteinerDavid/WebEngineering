import type { CommentRepository } from './repositories.js';
import type { Comment } from './comments.js';
import { NotFoundError } from './errors.js';

const hideAfterReports = 3;

export async function reportComment(
  repository: CommentRepository,
  id: string
): Promise<Comment> {
  // One atomic update covers the complete use case.
  const updated = await repository.incrementReports(id, hideAfterReports);
  if (updated === undefined) throw new NotFoundError('Comment not found.');
  return updated;
}
