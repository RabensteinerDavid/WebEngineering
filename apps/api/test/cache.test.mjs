import { test, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { createMemoryRepositories } from '../src/repositories/memory-repositories.ts';
import { createBearRoutes } from '../src/routes/bear-routes.ts';
import { createCommentRoutes } from '../src/routes/comment-routes.ts';
import { preventCaching } from '../src/middleware/cache-policy.ts';
import { errorHandler } from '../src/errors.ts';

test('ETags validate unchanged data and change when the representation changes', async () => {
  // Load test data and initialize in-memory repositories.
  const entries = JSON.parse(
    readFileSync(new URL('../fixtures/bears.json', import.meta.url))
  );
  const { bears, comments } = createMemoryRepositories(entries);

  // Set up the Express application with middleware and API routes.
  const app = express();
  app.use(preventCaching);
  app.use('/api/bears', createBearRoutes(bears));
  app.use('/api', createCommentRoutes(bears, comments, {}));
  app.use(errorHandler);

  // Initialize the test client and endpoint URLs.
  const client = request(app);
  const listUrl = '/api/bears';
  const detailUrl = `/api/bears/${entries[0].id}`;
  const commentsUrl = `${detailUrl}/comments`;

  // Test HTTP caching for both bear list and detail endpoints.
  for (const url of [listUrl, detailUrl]) {
    // Verify the public cache policy and the presence of an ETag.
    const first = await client.get(url).expect(200);
    expect(first.headers['cache-control']).toBe(
      'public, max-age=60, stale-while-revalidate=300'
    );
    expect(first.headers.etag).toBeTruthy();

    // Send a conditional request using the previously received ETag.
    const unchanged = await client
      .get(url)
      .set('If-None-Match', first.headers.etag)
      .expect(304);

    // An unchanged representation must return an empty response body.
    expect(unchanged.text).toBe('');

    // Modify the underlying data to change the representation.
    entries[0].name += ' updated';

    // Verify that the outdated ETag results in a 200 response.
    const changed = await client
      .get(url)
      .set('If-None-Match', first.headers.etag)
      .expect(200);

    // Verify that the modified representation has a different ETag.
    expect(changed.headers.etag).not.toBe(first.headers.etag);
  }

  // Verify that comments can only be cached privately
  // and must be validated before reuse.
  const firstPage = await client.get(commentsUrl).expect(200);
  expect(firstPage.headers['cache-control']).toBe('private, no-cache');

  // Verify that unchanged comments return 304 Not Modified.
  await client
    .get(commentsUrl)
    .set('If-None-Match', firstPage.headers.etag)
    .expect(304);

  // Add a comment to change the representation.
  await comments.create(entries[0].id, {
    author: 'Test',
    text: 'New comment',
  });

  // Verify that changed comments return 200 OK with a new ETag.
  const changedPage = await client
    .get(commentsUrl)
    .set('If-None-Match', firstPage.headers.etag)
    .expect(200);
  expect(changedPage.headers.etag).not.toBe(firstPage.headers.etag);

  // Verify that invalid requests return 400 and must not be cached.
  const invalid = await client.get('/api/bears?q=x&extra=y').expect(400);
  expect(invalid.headers['cache-control']).toBe('private, no-store');
});
