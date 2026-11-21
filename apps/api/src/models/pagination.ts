import { z } from '../config/zod.js';
import { ValidationError } from '../errors.js';
import type { Comment } from './comments.js';

const firstIndex = 0;
const lastIndex = -1;
const defaultLimit = 20;
const maxLimit = 100;
const maxCursorLength = 512;
export const pageQuery = z.strictObject({
  limit: z.coerce.number().int().positive().max(maxLimit).default(defaultLimit),
  cursor: z.base64url().max(maxCursorLength).optional(),
});
const cursorSchema = z.object({ createdAt: z.iso.datetime(), id: z.uuid() });
export type Cursor = z.infer<typeof cursorSchema>;
export interface CommentPage {
  items: Comment[];
  nextCursor: string | null;
}

export function decodeCursor(value: string): Cursor {
  try {
    return cursorSchema.parse(
      JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    );
  } catch {
    throw new ValidationError('Invalid comment cursor.', [
      {
        field: 'cursor',
        message: 'Use the nextCursor from the previous page.',
      },
    ]);
  }
}

export function makePage(
  rows: Comment[],
  limit: number,
  timestamp?: string
): CommentPage {
  const items = rows.slice(firstIndex, limit);
  const last = items.at(lastIndex);
  const nextCursor =
    rows.length > limit && last !== undefined
      ? Buffer.from(
          JSON.stringify({
            createdAt: timestamp ?? last.createdAt,
            id: last.id,
          })
        ).toString('base64url')
      : null;
  return { items, nextCursor };
}
