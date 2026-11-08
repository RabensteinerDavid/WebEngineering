import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { loadBears } from './bears.js';
import { sendUpstreamError } from './bear-routes.js';

export const commentRoutes = Router();

const minimumLength = 1;
const maxAuthorLength = 80;
const maxTextLength = 2000;
const badRequest = 400;
const notFound = 404;
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
  try {
    const {
      params: { id },
    } = request;
    if (!(await bearExists(id))) {
      response.status(notFound).json({ message: 'Bear not found.' });
      return;
    }

    response.json(
      [...comments.values()].filter((comment) => comment.bearId === id)
    );
  } catch (error) {
    sendUpstreamError(response, error);
  }
});

commentRoutes.post('/bears/:id/comments', async (request, response) => {
  const result = newCommentSchema.safeParse(request.body);
  if (!result.success) {
    response.status(badRequest).json({ message: 'Author or text is invalid.' });
    return;
  }

  try {
    const {
      params: { id },
    } = request;
    if (!(await bearExists(id))) {
      response.status(notFound).json({ message: 'Bear not found.' });
      return;
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
  } catch (error) {
    sendUpstreamError(response, error);
  }
});

commentRoutes.get('/comments/:commentId', (request, response) => {
  const comment = comments.get(request.params.commentId);

  if (comment === undefined) {
    response.status(notFound).json({ message: 'Comment not found.' });
    return;
  }

  response.json(comment);
});

commentRoutes.delete('/comments/:commentId', (request, response) => {
  const deleted = comments.delete(request.params.commentId);
  if (!deleted) {
    response.status(notFound).json({ message: 'Comment not found.' });
    return;
  }

  response.status(noContent).end();
});
