import { Router } from 'express';
import type { BearRepository } from '../repositories/interfaces.js';
import { NotFoundError, ValidationError } from '../errors.js';

export function createBearRoutes(bears: BearRepository): Router {
  const bearRoutes = Router();

  bearRoutes.get('/', async (request, response) => {
    const {
      query: { q },
    } = request;
    if (q !== undefined && typeof q !== 'string')
      throw new ValidationError('Invalid search.', [
        { field: 'q', message: 'Expected one search string.' },
      ]);
    response.json(await bears.list(q));
  });

  bearRoutes.get('/:id', async (request, response) => {
    const bear = await bears.findById(request.params.id);
    if (bear === undefined) throw new NotFoundError('Bear not found.');
    response.json(bear);
  });
  return bearRoutes;
}
