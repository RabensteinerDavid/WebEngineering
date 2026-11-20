import type { User, UserCredentials } from '../models/users.js';
import type { Cursor, CommentPage } from '../models/pagination.js';
import type { Bear } from '../models/bears.js';
import type { Comment, NewComment } from '../models/comments.js';

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
  create: (
    bearId: string,
    input: NewComment,
    authorId?: string
  ) => Promise<Comment>;
  findById: (id: string) => Promise<Comment | undefined>;
  incrementReports: (
    id: string,
    hideAt: number
  ) => Promise<Comment | undefined>;
  remove: (id: string, actor?: User) => Promise<boolean>;
}

export interface UserRepository {
  findByEmail: (email: string) => Promise<UserCredentials | undefined>;
  findById: (id: string) => Promise<User | undefined>;
  create: (email: string, passwordHash: string) => Promise<User | undefined>;
}
