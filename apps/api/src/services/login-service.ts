import { hash, verify, argon2id } from 'argon2';
import { randomBytes } from 'node:crypto';
import { HttpError } from '../errors.js';
import type { UserRepository } from '../repositories/interfaces.js';
import type { Registration, User } from '../models/users.js';

const unauthorized = 401;
const dummySecretBytes = 32;
const dummyHash = await hash(randomBytes(dummySecretBytes), { type: argon2id });

export async function loginUser(
  repository: UserRepository,
  input: Registration
): Promise<User> {
  const user = await repository.findByEmail(input.email);
  const valid = await verify(user?.passwordHash ?? dummyHash, input.password);
  if (user === undefined || !valid)
    throw new HttpError(unauthorized, 'Invalid credentials.');
  const { id, email, role, createdAt } = user;
  return { id, email, role, createdAt };
}
