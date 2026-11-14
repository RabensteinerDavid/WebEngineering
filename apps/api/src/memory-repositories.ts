import { makePage } from './pagination.js';
import { randomUUID } from 'node:crypto';
import type { Bear } from './bears.js';
import type { Comment } from './comments.js';
import type { BearRepository, CommentRepository } from './repositories.js';

const initialReportCount = 0;
const oneReport = 1;

export function createMemoryRepositories(entries: Bear[]): {
  bears: BearRepository;
  comments: CommentRepository;
} {
  const comments = new Map<string, Comment>();

  return {
    bears: {
      list: async (query = '') =>
        await Promise.resolve(
          entries.filter((bear) =>
            bear.name.toLowerCase().includes(query.toLowerCase())
          )
        ),
      findById: async (id) =>
        await Promise.resolve(entries.find((bear) => bear.id === id)),
    },
    comments: {
      listByBear: async (id, limit, cursor) => {
        const rows = [...comments.values()]
          .filter(
            (comment) =>
              comment.hiddenAt === null &&
              comment.bearId === id &&
              (cursor === undefined ||
                comment.createdAt < cursor.createdAt ||
                (comment.createdAt === cursor.createdAt &&
                  comment.id < cursor.id))
          )
          .sort((a, b) =>
            a.createdAt === b.createdAt
              ? b.id.localeCompare(a.id)
              : b.createdAt.localeCompare(a.createdAt)
          );
        return await Promise.resolve(makePage(rows, limit));
      },
      create: async (bearId, input) => {
        const comment: Comment = {
          ...input,
          reportCount: initialReportCount,
          hiddenAt: null,
          bearId,
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        };

        comments.set(comment.id, comment);
        return await Promise.resolve(comment);
      },

      findById: async (id) => await Promise.resolve(comments.get(id)),
      async incrementReports(id, hideAt) {
        const comment = comments.get(id);
        if (comment !== undefined) {
          comment.reportCount += oneReport;
          if (comment.reportCount >= hideAt)
            comment.hiddenAt ??= new Date().toISOString();
        }
        return await Promise.resolve(comment);
      },
      remove: async (id) => await Promise.resolve(comments.delete(id)),
    },
  };
}
