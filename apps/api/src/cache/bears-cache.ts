import { LRUCache } from 'lru-cache';
import type { Bear } from '../models/bears.js';

const maxEntries = 500;
const ttlMs = 60_000;

export interface BearsCache {
  get: (key: string, load: () => Promise<Bear[]>) => Promise<Bear[]>;
  clear: () => void;
  stats: { hits: number; misses: number; loads: number };
}

const initialCount = 0;
const increment = 1;

export function createBearsCache(): BearsCache {
  const values = new LRUCache<string, Bear[]>({ max: maxEntries, ttl: ttlMs });
  const inflight = new Map<string, Promise<Bear[]>>();
  const stats = {
    hits: initialCount,
    misses: initialCount,
    loads: initialCount,
  };
  let generation = 0;

  function clear(): void {
    generation += increment;
    values.clear();
    inflight.clear();
  }

  async function get(
    key: string,
    load: () => Promise<Bear[]>
  ): Promise<Bear[]> {
    const hit = values.get(key);
    if (hit !== undefined) {
      stats.hits += increment;
      return hit;
    }
    stats.misses += increment;
    const running = inflight.get(key);
    if (running !== undefined) return await running;

    stats.loads += increment;
    const startedGeneration = generation;
    const pending = Promise.resolve()
      .then(load)
      .then((entries) => {
        // A load started before invalidation must not repopulate the cache.
        if (generation === startedGeneration) values.set(key, entries);
        return entries;
      })
      .finally(() => {
        if (inflight.get(key) === pending) inflight.delete(key);
      });
    inflight.set(key, pending);
    return await pending;
  }

  return { get, clear, stats };
}

export const bearsCache = createBearsCache();
export const wikipediaCache = createBearsCache();

export function onBearsChanged(): void {
  bearsCache.clear();
  wikipediaCache.clear();
}
