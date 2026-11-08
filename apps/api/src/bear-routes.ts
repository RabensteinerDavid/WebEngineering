import { Router } from 'express';
import { loadBears } from './bears.js';
import { NotFoundError } from './errors.js';

export const bearRoutes = Router();

bearRoutes.get('/', async (_request, response) => {
  response.json(await loadBears());
});

bearRoutes.get('/:id', async (request, response) => {
  const bears = await loadBears();
  const bear = bears.find((entry) => entry.id === request.params.id);
  if (bear === undefined) throw new NotFoundError('Bear not found.');
  response.json(bear);
});
