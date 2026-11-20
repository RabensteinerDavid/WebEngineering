import { Router } from 'express';
import { registrationSchema } from '../models/users.js';
import { registerUser } from '../services/register-service.js';
import { ValidationError } from '../errors.js';
import type { UserRepository } from '../repositories/interfaces.js';

const created = 201;
export function createAuthRoutes(users: UserRepository): Router {
  const router = Router();
  router.post('/register', async (request, response) => {
    const result = registrationSchema.safeParse(request.body);
    if (!result.success)
      throw new ValidationError(
        'Invalid registration details.',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    response.status(created).json(await registerUser(users, result.data));
  });
  return router;
}
