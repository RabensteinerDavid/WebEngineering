import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { createCommentRoutes } from '../src/comment-routes.ts';
import {
  bearRepository,
  commentRepository,
} from '../src/postgres-repositories.ts';
import { pool } from '../src/db.ts';
import { naiveRepository } from './naive-reports.mjs';

async function measure(label, repository, bearId) {
  const app = express();
  app.use('/api', createCommentRoutes(bearRepository, repository));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const comment = await repository.create(bearId, {
      author: 'Demo',
      text: 'Report storm',
    });
    try {
      const url =
        'http://127.0.0.1:' +
        server.address().port +
        '/api/comments/' +
        comment.id;
      const results = await Promise.all(
        Array.from({ length: 50 }, () =>
          fetch(url + '/report', { method: 'POST' })
        )
      );
      assert.ok(results.every((response) => response.status === 200));
      const stored = await (await fetch(url)).json();
      console.log(label, stored.reportCount, '/ 50');
      if (label === 'Atomic') {
        assert.equal(stored.reportCount, 50);
        assert.ok(stored.hiddenAt);
      }
    } finally {
      await repository.remove(comment.id);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

try {
  const [bear] = await bearRepository.list();
  if (!bear) throw new Error('Run npm run db:seed first.');
  await measure('Naive', naiveRepository, bear.id);
  await measure('Atomic', commentRepository, bear.id);
} finally {
  await pool.end();
}
