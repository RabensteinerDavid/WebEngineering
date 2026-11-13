import { randomUUID } from 'node:crypto';
import type { Bear } from './bears.js';
import type { Comment } from './comments.js';
import type { BearRepository, CommentRepository } from './repositories.js';

export function createMemoryRepositories(entries: Bear[]): {
  bears: BearRepository;
  comments: CommentRepository;
} {
  const comments = new Map<string, Comment>();

  return {
    bears: {
      list: async () => await Promise.resolve([...entries]),
      findById: async (id) =>
        await Promise.resolve(entries.find((bear) => bear.id === id)),
    },
    comments: {
      listByBear: async (id) =>
        await Promise.resolve(
          [...comments.values()].filter((comment) => comment.bearId === id)
        ),

      create: async (bearId, input) => {
        const comment: Comment = {
          ...input,
          bearId,
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        };

        comments.set(comment.id, comment);
        return await Promise.resolve(comment);
      },

      findById: async (id) => await Promise.resolve(comments.get(id)),
      remove: async (id) => await Promise.resolve(comments.delete(id)),
    },
  };
}
