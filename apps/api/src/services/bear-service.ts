import { bearsCache } from '../cache/bears-cache.js';
import type { BearRepository } from '../repositories/interfaces.js';

export function withBearsCache(repository: BearRepository): BearRepository {
  return {
    async list(query = '') {
      const term = query.trim().toLowerCase();
      return await bearsCache.get(
        term,
        async () => await repository.list(term)
      );
    },
    findById: async (id) => await repository.findById(id),
  };
}
