import { preventCaching } from './middleware/cache-policy.js';
import helmet from 'helmet';
import { sessionMiddleware } from './middleware/session.js';
import { env } from './config/env.js';
import { createAuthRoutes } from './routes/auth-routes.js';
import { userRepository } from './repositories/user-repository.js';
import {
  bearRepository,
  commentRepository,
} from './repositories/postgres-repositories.js';
import { checkDatabase } from './db/client.js';
import express from 'express';
import {
  requestLogger,
  errorHandler,
  HttpError,
  NotFoundError,
} from './errors.js';
import { createBearRoutes } from './routes/bear-routes.js';
import { createCommentRoutes } from './routes/comment-routes.js';
import { readFileSync } from 'node:fs';
import { allowCors } from './middleware/cors.js';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiDocument } from './docs/openapi.js';

const app = express();
const proxyHops = 1;
if (env.NODE_ENV === 'production') app.set('trust proxy', proxyHops);
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

app.set('etag', 'weak');
app.use(preventCaching);
app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'upgrade-insecure-requests': env.NODE_ENV === 'production' ? [] : null,
      },
    },
    strictTransportSecurity: env.NODE_ENV === 'production',
  })
);
app.use(allowCors);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', version, uptime: process.uptime() });
});

const serviceUnavailable = 503;
app.get('/health/ready', async (_request, response) => {
  try {
    await checkDatabase();
  } catch (error) {
    throw new HttpError(
      serviceUnavailable,
      'Database is unavailable.',
      [],
      error
    );
  }
  response.json({ status: 'ok' });
});

app.use(express.json({ limit: '16kb' }));
app.use('/api', sessionMiddleware);
app.use('/api/auth', createAuthRoutes(userRepository));
app.use('/api/bears', createBearRoutes(bearRepository));
app.use(
  '/api',
  createCommentRoutes(bearRepository, commentRepository, userRepository)
);

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
