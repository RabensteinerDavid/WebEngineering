import { bearSchema } from '../models/bears.js';
import { commentSchema } from '../models/comments.js';
import { validate, emptyInput } from '../middleware/validate.js';
import { requireUser, requireCommentOwner } from '../policies/comments.js';
import { reportComment } from '../services/report-service.js';
import { decodeCursor, pageQuery } from '../models/pagination.js';
import { Router } from 'express';
import { newCommentSchema } from '../models/comments.js';
import { NotFoundError, ValidationError } from '../errors.js';
import type {
  BearRepository,
  CommentRepository,
  UserRepository,
} from '../repositories/interfaces.js';

const created = 201;
const noContent = 204;

export function createCommentRoutes(
  bears: BearRepository,
  comments: CommentRepository,
  users: UserRepository
): Router {
  const commentRoutes = Router();
  commentRoutes.param('id', (_request, _response, next, value: unknown) => {
    validate(bearSchema.shape.id, value);
    next();
  });
  commentRoutes.param(
    'commentId',
    (_request, _response, next, value: unknown) => {
      validate(commentSchema.shape.id, value);
      next();
    }
  );
  commentRoutes.get('/bears/:id/comments', async (request, response) => {
    const {
      params: { id },
    } = request;
    if ((await bears.findById(id)) === undefined) {
      throw new NotFoundError('Bear not found.');
    }

    const query = pageQuery.safeParse(request.query);
    if (!query.success)
      throw new ValidationError(
        'Invalid pagination parameters.',
        query.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    const {
      data: { limit, cursor },
    } = query;
    const page = await comments.listByBear(
      id,
      limit,
      cursor === undefined ? undefined : decodeCursor(cursor)
    );
    response.set('Cache-Control', 'private, no-cache');
    response.json(page);
  });

  commentRoutes.post('/bears/:id/comments', async (request, response) => {
    validate(emptyInput, request.query);
    const user = await requireUser(users, request.session.userId);
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

    const comment = await comments.create(id, result.data, user.id);

    response
      .status(created)
      .location(`/api/comments/${comment.id}`)
      .json(comment);
  });

  commentRoutes.get('/comments/:commentId', async (request, response) => {
    validate(emptyInput, request.query);
    const comment = await comments.findById(request.params.commentId);

    if (comment === undefined) {
      throw new NotFoundError('Comment not found.');
    }

    response.set('Cache-Control', 'private, no-cache');
    response.json(comment);
  });

  commentRoutes.post(
    '/comments/:commentId/report',
    async (request, response) => {
      validate(emptyInput, request.query);
      validate(emptyInput, request.body ?? {});
      response.json(await reportComment(comments, request.params.commentId));
    }
  );

  commentRoutes.delete('/comments/:commentId', async (request, response) => {
    validate(emptyInput, request.query);
    const user = await requireUser(users, request.session.userId);
    const comment = await comments.findById(request.params.commentId);
    if (comment === undefined) throw new NotFoundError('Comment not found.');
    requireCommentOwner(user, comment);
    const deleted = await comments.remove(request.params.commentId, user);
    if (!deleted) {
      throw new NotFoundError('Comment not found.');
    }

    response.status(noContent).end();
  });
  return commentRoutes;
}
