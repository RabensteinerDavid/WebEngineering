import cors from 'cors';

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim());

export const allowCors = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-request-id'],
  exposedHeaders: ['Location', 'x-request-id'],
});
