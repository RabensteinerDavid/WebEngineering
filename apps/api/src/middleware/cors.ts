import cors from 'cors';

import { env } from '../config/env.js';

export const allowCors = cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-request-id', 'If-None-Match'],
  exposedHeaders: ['Location', 'x-request-id', 'Retry-After', 'ETag'],
});
