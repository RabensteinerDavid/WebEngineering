import { Router, type Response } from 'express';
import { loadBears } from './bears.js';

export const bearRoutes = Router();
const badGateway = 502;
const gatewayTimeout = 504;
const notFound = 404;

export function sendUpstreamError(response: Response, error: unknown): void {
  const timedOut = error instanceof Error && error.name === 'TimeoutError';
  response.status(timedOut ? gatewayTimeout : badGateway).json({
    message: timedOut
      ? 'Wikipedia took too long to respond.'
      : 'Could not load bear data from Wikipedia.',
  });
}

bearRoutes.get('/', async (_request, response) => {
  try {
    response.json(await loadBears());
  } catch (error) {
    sendUpstreamError(response, error);
  }
});

bearRoutes.get('/:id', async (request, response) => {
  try {
    const bears = await loadBears();
    const bear = bears.find((entry) => entry.id === request.params.id);
    if (bear === undefined) {
      response.status(notFound).json({ message: 'Bear not found.' });
      return;
    }
    response.json(bear);
  } catch (error) {
    sendUpstreamError(response, error);
  }
});
