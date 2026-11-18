import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import express from 'express';
import { createBearRoutes } from '../src/routes/bear-routes.ts';
import { createCommentRoutes } from '../src/routes/comment-routes.ts';
import { errorHandler } from '../src/errors.ts';
import { createMemoryRepositories } from '../src/repositories/memory-repositories.ts';

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
  assert.deepEqual(await (await fetch(collection)).json(), {
    items: [comment],
    nextCursor: null,
  });

  // Test 5: Verify that other bears do not contain this comment.
  assert.deepEqual(
    await (await fetch(base + '/bears/' + entries[1].id + '/comments')).json(),
    { items: [], nextCursor: null }
  );

  // Test 6: Create a second comment for pagination testing.
  await fetch(collection, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author: 'Test', text: 'Second' }),
  });

  // Test 7: Verify that the first page contains one item and a next cursor.
  const first = await (await fetch(collection + '?limit=1')).json();
  assert.equal(first.items.length, 1);
  assert.ok(first.nextCursor);

  // Test 8: Verify that the next page contains a different comment.
  const second = await (
    await fetch(collection + '?limit=1&cursor=' + first.nextCursor)
  ).json();
  assert.equal(second.items.length, 1);
  assert.notEqual(first.items[0].id, second.items[0].id);

  // Test 9: Verify that the last page has no next cursor.
  assert.equal(second.nextCursor, null);

  // Test 10: Verify that an invalid cursor returns HTTP 400.
  assert.equal((await fetch(collection + '?cursor=bad')).status, 400);

  // Test 11: Verify that bear search is case-insensitive.
  const filtered = await (await fetch(base + '/bears?q=PANDA')).json();
  assert.deepEqual(
    filtered,
    entries.filter((bear) => bear.name.toLowerCase().includes('panda'))
  );

  // Test 12: Retrieve the comment by its ID.
  const url = base + '/comments/' + comment.id;
  assert.deepEqual(await (await fetch(url)).json(), comment);

  // Set up a helper to report the comment.
  const report = async () => {
    const response = await fetch(url + '/report', { method: 'POST' });
    assert.equal(response.status, 200);
    return await response.json();
  };

  // Test 13: Verify that the first report does not hide the comment.
  assert.equal((await report()).hiddenAt, null);

  // Test 14: Verify that the second report does not hide the comment.
  assert.equal((await report()).hiddenAt, null);

  // Test 15: Verify that the third report hides the comment.
  const hidden = await report();
  assert.equal(hidden.reportCount, 3);
  assert.ok(hidden.hiddenAt);

  // Test 16: Verify that additional reports preserve the original hidden timestamp.
  assert.equal((await report()).hiddenAt, hidden.hiddenAt);

  // Test 17: Verify that hidden comments are excluded from the comment list.
  const visible = await (await fetch(collection)).json();
  assert.ok(visible.items.every((item) => item.id !== comment.id));

  // Test 18: Delete the comment and verify the HTTP 204 status.
  assert.equal((await fetch(url, { method: 'DELETE' })).status, 204);

  // Test 19: Verify that the deleted comment returns HTTP 404.
  assert.equal((await fetch(url)).status, 404);
});
