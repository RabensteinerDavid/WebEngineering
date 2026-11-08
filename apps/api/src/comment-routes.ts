import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { loadBears } from './bears.js';
import { NotFoundError, ValidationError } from './errors.js';

export const commentRoutes = Router();

const minimumLength = 1;
const maxAuthorLength = 80;
const maxTextLength = 2000;
const created = 201;
const noContent = 204;

const newCommentSchema = z.object({
  author: z.string().trim().min(minimumLength).max(maxAuthorLength),
  text: z.string().trim().min(minimumLength).max(maxTextLength),
});

type Comment = z.infer<typeof newCommentSchema> & {
  id: string;
  bearId: string;
  createdAt: string;
};

const comments = new Map<string, Comment>();

async function bearExists(id: string): Promise<boolean> {
  const bears = await loadBears();
  return bears.some((bear) => bear.id === id);
}

commentRoutes.get('/bears/:id/comments', async (request, response) => {
  const {
    params: { id },
  } = request;
  if (!(await bearExists(id))) {
    throw new NotFoundError('Bear not found.');
  }

  response.json(
    [...comments.values()].filter((comment) => comment.bearId === id)
  );
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
  if (!(await bearExists(id))) {
    throw new NotFoundError('Bear not found.');
  }

  const comment: Comment = {
    id: randomUUID(),
    bearId: id,
    ...result.data,
    createdAt: new Date().toISOString(),
  };
  comments.set(comment.id, comment);

  response
    .status(created)
    .location(`/api/comments/${comment.id}`)
    .json(comment);
});

commentRoutes.get('/comments/:commentId', (request, response) => {
  const comment = comments.get(request.params.commentId);

  if (comment === undefined) {
    throw new NotFoundError('Comment not found.');
  }

  response.json(comment);
});

commentRoutes.delete('/comments/:commentId', (request, response) => {
  const deleted = comments.delete(request.params.commentId);
  if (!deleted) {
    throw new NotFoundError('Comment not found.');
  }

  response.status(noContent).end();
});
