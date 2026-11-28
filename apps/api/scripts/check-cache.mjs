import assert from 'node:assert/strict';

const apiUrl = process.argv[2] ?? 'http://localhost:3000';
const term = `cache-proof-${Date.now()}`;
const before = await (await fetch(`${apiUrl}/metrics`)).json();
const responses = await Promise.all(
  Array.from({ length: 50 }, () => fetch(`${apiUrl}/api/bears?q=${term}`))
);
for (const response of responses) {
  assert.equal(response.status, 200);
  await response.json();
}
const after = await (await fetch(`${apiUrl}/metrics`)).json();
const loads = after.bears.loads - before.bears.loads;
assert.equal(loads, 1);
console.log(`50 cold requests, ${loads} database load.`);
