import cors from 'cors';

import { env } from '../config/env.js';

export const allowCors = cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-request-id'],
  exposedHeaders: ['Location', 'x-request-id', 'Retry-After'],
});
