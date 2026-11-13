import { Router } from 'express';
import { newCommentSchema } from './comments.js';
import { NotFoundError, ValidationError } from './errors.js';
import type { BearRepository, CommentRepository } from './repositories.js';

const created = 201;
const noContent = 204;

export function createCommentRoutes(
  bears: BearRepository,
  comments: CommentRepository
): Router {
  const commentRoutes = Router();
  commentRoutes.get('/bears/:id/comments', async (request, response) => {
    const {
      params: { id },
    } = request;
    if ((await bears.findById(id)) === undefined) {
      throw new NotFoundError('Bear not found.');
    }

    response.json(await comments.listByBear(id));
  });

  commentRoutes.post('/bears/:id/comments', async (request, response) => {
    const result = newCommentSchema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError(
        'Author or text is invalid.',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    }

    const {
      params: { id },
    } = request;
    if ((await bears.findById(id)) === undefined) {
      throw new NotFoundError('Bear not found.');
    }

    const comment = await comments.create(id, result.data);

    response
      .status(created)
      .location(`/api/comments/${comment.id}`)
      .json(comment);
  });

  commentRoutes.get('/comments/:commentId', async (request, response) => {
    const comment = await comments.findById(request.params.commentId);

    if (comment === undefined) {
      throw new NotFoundError('Comment not found.');
    }

    response.json(comment);
  });

  commentRoutes.delete('/comments/:commentId', async (request, response) => {
    const deleted = await comments.remove(request.params.commentId);
    if (!deleted) {
      throw new NotFoundError('Comment not found.');
    }

    response.status(noContent).end();
  });
  return commentRoutes;
}
