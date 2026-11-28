import type { RequestHandler } from 'express';

export const preventCaching: RequestHandler = (_request, response, next) => {
  response.set('Cache-Control', 'private, no-store');
  next();
};
