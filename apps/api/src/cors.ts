import cors from 'cors';

import { env } from './env.js';

export const allowCors = cors({
  origin: env.CORS_ORIGINS,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-request-id'],
  exposedHeaders: ['Location', 'x-request-id'],
});
