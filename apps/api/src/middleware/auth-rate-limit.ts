import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../errors.js';

const windowMs = 60_000;
const limit = 10;
const tooManyRequests = 429;

export function createAuthRateLimit(): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_request, _response, next) => {
      next(
        new HttpError(tooManyRequests, 'Too many attempts. Try again later.')
      );
    },
  });
}
