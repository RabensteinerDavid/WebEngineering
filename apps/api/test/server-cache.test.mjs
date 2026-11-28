import { test, expect, vi, afterEach } from 'vitest';
import {
  createBearsCache,
  bearsCache,
  wikipediaCache,
} from '../src/cache/bears-cache.ts';
import { withBearsCache } from '../src/services/bear-service.ts';

// Restore mocked globals and environment variables,
// and clear both caches after each test.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  bearsCache.clear();
  wikipediaCache.clear();
});

test('50 cold list requests share one repository load; normalized searches hit the cache', async () => {
  // Create a mocked repository and wrap it with the caching service.
  const list = vi.fn(async () => [{ id: 'u-arctos' }]);
  const service = withBearsCache({ list, findById: vi.fn() });
  const before = { ...bearsCache.stats };

  // Simulate 50 concurrent requests for an uncached search query.
  const results = await Promise.all(
    Array.from({ length: 50 }, () => service.list(' PANDA '))
  );

  // Verify that request coalescing prevents a cache stampede.
  expect(list).toHaveBeenCalledTimes(1);

  // Verify that the search query is normalized.
  expect(list).toHaveBeenCalledWith('panda');

  // Verify that all requests receive the same result reference.
  expect(results.every((result) => result === results[0])).toBe(true);

  // Request the normalized query again to trigger a cache hit.
  await service.list('panda');

  // Verify one repository load, one cache hit, and 50 cache misses.
  expect(bearsCache.stats.loads - before.loads).toBe(1);
  expect(bearsCache.stats.hits - before.hits).toBe(1);
  expect(bearsCache.stats.misses - before.misses).toBe(50);
});

test('failed loads are shared but never cached', async () => {
  const cache = createBearsCache();

  // Simulate a failed load followed by a successful load.
  const load = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([]);

  // Simulate 50 concurrent requests sharing the same failing load.
  const results = await Promise.allSettled(
    Array.from({ length: 50 }, () => cache.get('list', load))
  );

  // Verify that all requests fail but only one load is executed.
  expect(results.every((result) => result.status === 'rejected')).toBe(true);
  expect(load).toHaveBeenCalledTimes(1);

  // Verify that the failure was not cached and a new load is attempted.
  await expect(cache.get('list', load)).resolves.toEqual([]);
  expect(load).toHaveBeenCalledTimes(2);
});

test('invalidation prevents an older pending load from replacing new data', async () => {
  const cache = createBearsCache();
  let finish;

  // Start a pending load that can be resolved manually.
  const old = cache.get(
    'list',
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );

  // Allow the pending loader to start before invalidating the cache.
  await Promise.resolve();
  cache.clear();

  // Load and cache updated data after invalidation.
  const updated = [{ id: 'new' }];
  await cache.get('list', async () => updated);

  // Complete the older pending request with outdated data.
  finish([{ id: 'old' }]);
  await old;

  // Verify that the outdated result cannot overwrite the updated cache entry.
  expect(await cache.get('list', async () => [])).toEqual(updated);
});

test('the cache evicts old entries after reaching its maximum size', async () => {
  const cache = createBearsCache();

  // Insert 501 entries to exceed the cache capacity of 500.
  await Promise.all(
    Array.from({ length: 501 }, (_, index) =>
      cache.get(String(index), async () => [])
    )
  );

  // Request the oldest entry again.
  const load = vi.fn(async () => []);
  await cache.get('0', load);

  // Verify that the oldest entry was evicted and must be reloaded.
  expect(load).toHaveBeenCalledTimes(1);
});

test('50 cold Wikipedia requests share one upstream load', async () => {
  // Provide the required environment variables for the test.
  vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost/test');
  vi.stubEnv(
    'SESSION_SECRET',
    'test-only-session-secret-at-least-32-characters'
  );

  // Mock Wikipedia API responses for article content and image metadata.
  const wikiFetch = vi.fn(async (url) => {
    const body =
      url.searchParams.get('action') === 'parse'
        ? {
            parse: {
              wikitext: {
                '*': '{{Species table/row|name=[[Brown bear]]\n|binomial=U. arctos\n|range=Europe |range-image=\n|image=File:Bear.jpg\n',
              },
            },
          }
        : {
            query: {
              pages: {
                1: {
                  title: 'File:Bear.jpg',
                  imageinfo: [{ url: 'https://example.com/bear.jpg' }],
                },
              },
            },
          };

    return { ok: true, json: async () => body };
  });

  // Replace the global fetch function with the mocked implementation.
  vi.stubGlobal('fetch', wikiFetch);

  // Import the Wikipedia service after setting up the mocks.
  const { loadWikipediaBears } =
    await import('../src/services/wikipedia-service.ts');

  const before = wikipediaCache.stats.loads;

  // Simulate 50 concurrent requests with an empty Wikipedia cache.
  const results = await Promise.all(
    Array.from({ length: 50 }, () => loadWikipediaBears())
  );

  // Verify that all concurrent requests share a single cache load.
  expect(wikipediaCache.stats.loads - before).toBe(1);

  // One load requests the article and then the image metadata.
  expect(wikiFetch).toHaveBeenCalledTimes(2);

  // Verify that the returned bear data contains the expected ID.
  expect(results[0][0].id).toBe('u-arctos');
});
