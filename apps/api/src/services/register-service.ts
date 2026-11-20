import { hash, argon2id } from 'argon2';
import { HttpError } from '../errors.js';
import type { Registration, User } from '../models/users.js';
import type { UserRepository } from '../repositories/interfaces.js';

const conflict = 409;
const memoryCost = 65536;
const timeCost = 3;
const parallelism = 4;

export async function registerUser(
  repository: UserRepository,
  input: Registration
): Promise<User> {
  const passwordHash = await hash(input.password, {
    type: argon2id,
    memoryCost,
    timeCost,
    parallelism,
  });
  const user = await repository.create(input.email, passwordHash);
  if (user === undefined)
    throw new HttpError(conflict, 'Email is already registered.');
  return user;
}
