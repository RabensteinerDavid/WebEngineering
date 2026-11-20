import { z } from '../config/zod.js';
const minimumLength = 1;
const maxAuthorLength = 80;
const maxTextLength = 2000;

export const newCommentSchema = z.object({
  author: z.string().trim().min(minimumLength).max(maxAuthorLength),
  text: z.string().trim().min(minimumLength).max(maxTextLength),
});

export const commentSchema = newCommentSchema.extend({
  id: z.uuid(),
  bearId: z.string(),
  authorId: z.uuid().nullable(),
  reportCount: z.number().int().nonnegative(),
  hiddenAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export type Comment = z.infer<typeof commentSchema>;
export type NewComment = z.infer<typeof newCommentSchema>;
