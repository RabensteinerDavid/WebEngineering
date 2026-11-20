import { promisify } from 'node:util';
import { loginUser } from '../services/login-service.js';
import { cookieOptions } from '../middleware/session.js';
import { Router } from 'express';
import { registrationSchema, loginSchema } from '../models/users.js';
import { registerUser } from '../services/register-service.js';
import { ValidationError, HttpError } from '../errors.js';
import type { UserRepository } from '../repositories/interfaces.js';

const created = 201;
const unauthorized = 401;
const noContent = 204;
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

  router.post('/login', async (request, response) => {
    const result = loginSchema.safeParse(request.body);
    if (!result.success)
      throw new ValidationError(
        'Invalid login details.',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    const user = await loginUser(users, result.data);
    await promisify((done: (error?: unknown) => void) => {
      request.session.regenerate(done);
    })();
    const { session } = request;
    const { id } = user;
    session.userId = id;
    await promisify((done: (error?: unknown) => void) => {
      session.save(done);
    })();
    response.json(user);
  });
  router.get('/me', async (request, response) => {
    const {
      session: { userId },
    } = request;
    const user =
      userId === undefined ? undefined : await users.findById(userId);
    if (user === undefined) throw new HttpError(unauthorized, 'Not logged in.');
    response.json(user);
  });
  router.post('/logout', async (request, response) => {
    const { session } = request;
    await promisify((done: (error?: unknown) => void) => {
      session.destroy(done);
    })();
    response.clearCookie('bears.sid', cookieOptions).status(noContent).end();
  });
  return router;
}
