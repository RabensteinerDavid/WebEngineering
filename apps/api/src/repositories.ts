import type { Bear } from './bears.js';
import type { Comment, NewComment } from './comments.js';

export interface BearRepository {
  list: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  listByBear: (bearId: string) => Promise<Comment[]>;
  create: (bearId: string, input: NewComment) => Promise<Comment>;
  findById: (id: string) => Promise<Comment | undefined>;
  remove: (id: string) => Promise<boolean>;
}
