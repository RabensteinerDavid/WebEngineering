import express from 'express';
import { bearRoutes } from './bear-routes.js';
import { readFileSync } from 'node:fs';

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

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', version, uptime: process.uptime() });
});

app.use('/api/bears', bearRoutes);

app.listen(port, '0.0.0.0', () => {
  process.stdout.write(`API running on http://localhost:${port}\n`);
});
