import { test, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createCommentRoutes } from '../src/routes/comment-routes.ts';
import { createMemoryRepositories } from '../src/repositories/memory-repositories.ts';
import { errorHandler } from '../src/errors.ts';

test('IDOR: changing the comment ID does not allow deleting another user’s comment', async () => {
  const owner = { id: '11111111-1111-4111-8111-111111111111', role: 'user' };
  const attacker = { id: '22222222-2222-4222-8222-222222222222', role: 'user' };
  const users = {
    findById: async (id) => [owner, attacker].find((user) => user.id === id),
  };
  const { bears, comments } = createMemoryRepositories([]);
  const victimComment = await comments.create(
    'u-arctos',
    { author: 'Owner', text: 'This comment must survive the attack.' },
    owner.id
  );
  const ownComment = await comments.create(
    'u-arctos',
    { author: 'Attacker', text: 'My own comment.' },
    attacker.id
  );

  function clientFor(user) {
    const app = express();
    app.use((req, _res, next) => {
      req.session = { userId: user.id };
      next();
    });
    app.use('/api', createCommentRoutes(bears, comments, users));
    app.use(errorHandler);
    return request(app);
  }

  const attackerClient = clientFor(attacker);

  // Control: the attacker is logged in and can delete their own comment.
  await attackerClient.delete(`/api/comments/${ownComment.id}`).expect(204);
  expect(await comments.findById(ownComment.id)).toBeUndefined();

  // Attack: keep the same identity, but replace the URL ID with the victim's ID.
  const response = await attackerClient
    .delete(`/api/comments/${victimComment.id}`)
    .expect(403)
    .expect('Content-Type', /application\/problem\+json/);
  expect(response.body.detail).toBe('You may only delete your own comments.');
  expect(await comments.findById(victimComment.id)).toEqual(victimComment);

  // Control: the real owner can still delete that comment.
  await clientFor(owner)
    .delete(`/api/comments/${victimComment.id}`)
    .expect(204);
  expect(await comments.findById(victimComment.id)).toBeUndefined();
});
