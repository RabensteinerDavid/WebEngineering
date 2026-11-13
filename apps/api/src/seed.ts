import { sql } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { db, pool } from './db.js';
import { bearSchema } from './bears.js';
import { bears } from './schema.js';

try {
  const json = await readFile(
    new URL('../fixtures/bears.json', import.meta.url),
    'utf8'
  );
  const entries = bearSchema.array().nonempty().parse(JSON.parse(json));
  const rows = entries.map((bear, position) => ({ ...bear, position }));

  await db
    .insert(bears)
    .values(rows)
    .onConflictDoUpdate({
      target: bears.id,
      set: {
        name: sql`excluded.name`,
        binomial: sql`excluded.binomial`,
        image: sql`excluded.image_url`,
        range: sql`excluded.range`,
        position: sql`excluded.position`,
      },
    });
} finally {
  await pool.end();
}
