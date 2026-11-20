import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import type { UserRepository } from './interfaces.js';

export const userRepository: UserRepository = {
  async create(email, passwordHash) {
    const [row] = await db
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoNothing({ target: users.email })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    return row === undefined
      ? undefined
      : { ...row, createdAt: row.createdAt.toISOString() };
  },
};
