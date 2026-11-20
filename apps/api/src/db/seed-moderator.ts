import { hash, argon2id } from 'argon2';
import { db, pool } from './client.js';
import { users } from './schema.js';
import { registrationSchema } from '../models/users.js';

try {
  const input = registrationSchema.parse({
    email: process.env.MODERATOR_EMAIL,
    password: process.env.MODERATOR_PASSWORD,
  });
  const passwordHash = await hash(input.password, { type: argon2id });
  await db
    .insert(users)
    .values({ email: input.email, passwordHash, role: 'moderator' })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, role: 'moderator' },
    });
} finally {
  await pool.end();
}
