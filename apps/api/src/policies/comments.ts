import { HttpError } from '../errors.js';
import type { User } from '../models/users.js';
import type { Comment } from '../models/comments.js';
import type { UserRepository } from '../repositories/interfaces.js';

const unauthorized = 401;
const forbidden = 403;

export async function requireUser(
  users: UserRepository,
  userId?: string
): Promise<User> {
  const user = userId === undefined ? undefined : await users.findById(userId);
  if (user === undefined) throw new HttpError(unauthorized, 'Login required.');
  return user;
}

export function requireCommentOwner(user: User, comment: Comment): void {
  if (user.role !== 'moderator' && comment.authorId !== user.id) {
    throw new HttpError(forbidden, 'You may only delete your own comments.');
  }
}
