import { Router } from 'express';
import type { BearRepository } from './repositories.js';
import { NotFoundError } from './errors.js';

export function createBearRoutes(bears: BearRepository): Router {
  const bearRoutes = Router();

  bearRoutes.get('/', async (_request, response) => {
    response.json(await bears.list());
  });

  bearRoutes.get('/:id', async (request, response) => {
    const bear = await bears.findById(request.params.id);
    if (bear === undefined) throw new NotFoundError('Bear not found.');
    response.json(bear);
  });
  return bearRoutes;
}
