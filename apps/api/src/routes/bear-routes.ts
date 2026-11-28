import { bearSchema, bearSearchQuery } from '../models/bears.js';
import { validate, emptyInput } from '../middleware/validate.js';
import { Router } from 'express';
import type { BearRepository } from '../repositories/interfaces.js';
import { NotFoundError } from '../errors.js';

export function createBearRoutes(bears: BearRepository): Router {
  const bearRoutes = Router();

  bearRoutes.get('/', async (request, response) => {
    const { q } = validate(bearSearchQuery, request.query);
    const entries = await bears.list(q);
    response.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    );
    response.json(entries);
  });

  bearRoutes.get('/:id', async (request, response) => {
    validate(emptyInput, request.query);
    const bear = await bears.findById(
      validate(bearSchema.shape.id, request.params.id)
    );
    if (bear === undefined) throw new NotFoundError('Bear not found.');
    response.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    );
    response.json(bear);
  });
  return bearRoutes;
}
