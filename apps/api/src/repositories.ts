import type { Cursor, CommentPage } from './pagination.js';
import type { Bear } from './bears.js';
import type { Comment, NewComment } from './comments.js';

export interface BearRepository {
  list: (query?: string) => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    limit: number,
    cursor?: Cursor
  ) => Promise<CommentPage>;
  create: (bearId: string, input: NewComment) => Promise<Comment>;
  findById: (id: string) => Promise<Comment | undefined>;
  incrementReports: (
    id: string,
    hideAt: number
  ) => Promise<Comment | undefined>;
  remove: (id: string) => Promise<boolean>;
}
