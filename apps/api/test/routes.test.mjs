import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import express from 'express';
import { createBearRoutes } from '../src/bear-routes.ts';
import { createCommentRoutes } from '../src/comment-routes.ts';
import { errorHandler } from '../src/errors.ts';
import { createMemoryRepositories } from '../src/memory-repositories.ts';

test('comments belong to one bear and can be created, read and deleted', async (t) => {
  // Set up the test data and in-memory repositories.
  const entries = JSON.parse(
    readFileSync(new URL('../fixtures/bears.json', import.meta.url))
  );
  const { bears, comments } = createMemoryRepositories(entries);

  // Set up and start the Express test server.
  const app = express();
  app.use(express.json());
  app.use('/api/bears', createBearRoutes(bears));
  app.use('/api', createCommentRoutes(bears, comments));
  app.use(errorHandler);

  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, 'listening');

  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  const collection = base + '/bears/' + entries[0].id + '/comments';

  // Test 1: Verify that all bears are returned.
  assert.deepEqual(await (await fetch(base + '/bears')).json(), entries);

  // Test 2: Create a comment and verify the HTTP 201 status.
  const created = await fetch(collection, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author: 'Test', text: 'Hello' }),
  });
  assert.equal(created.status, 201);

  // Test 3: Verify that the comment belongs to the correct bear.
  const comment = await created.json();
  assert.equal(comment.bearId, entries[0].id);

  // Test 4: Verify that the created comment appears in the bear's comments.
  assert.deepEqual(await (await fetch(collection)).json(), [comment]);

  // Test 5: Verify that other bears do not contain this comment.
  assert.deepEqual(
    await (await fetch(base + '/bears/' + entries[1].id + '/comments')).json(),
    []
  );

  // Test 6: Retrieve the comment by its ID.
  const url = base + '/comments/' + comment.id;
  assert.deepEqual(await (await fetch(url)).json(), comment);

  // Test 7: Delete the comment and verify the HTTP 204 status.
  assert.equal((await fetch(url, { method: 'DELETE' })).status, 204);

  // Test 8: Verify that the deleted comment returns HTTP 404.
  assert.equal((await fetch(url)).status, 404);
});
