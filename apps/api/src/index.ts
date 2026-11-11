import express from 'express';
import { requestLogger, errorHandler, NotFoundError } from './errors.js';
import { bearRoutes } from './bear-routes.js';
import { commentRoutes } from './comment-routes.js';
import { readFileSync } from 'node:fs';
import { allowCors } from './cors.js';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiDocument } from './openapi.js';

const app = express();
const port = 3000;
const packageInfo: unknown = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);
if (
  typeof packageInfo !== 'object' ||
  packageInfo === null ||
  !('version' in packageInfo) ||
  typeof packageInfo.version !== 'string'
) {
  throw new Error('Missing API package version');
}
const { version } = packageInfo;

app.use(requestLogger);
app.use(allowCors);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', version, uptime: process.uptime() });
});

app.use(express.json());
app.use('/api/bears', bearRoutes);
app.use('/api', commentRoutes);

const openApiDocument = createOpenApiDocument(version);
app.get('/api/openapi.json', (_request, response) => {
  response.json(openApiDocument);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Demonstrates the central error handler for Task 4.
app.get('/api/debug/error', () => {
  throw new Error('Demo error');
});

app.use(() => {
  throw new NotFoundError('Route not found.');
});
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  process.stdout.write(`API running on http://localhost:${port}\n`);
});
