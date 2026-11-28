import { onBearsChanged } from '../cache/bears-cache.js';
import { sql } from 'drizzle-orm';
import { db } from './client.js';
import { bears } from './schema.js';
import type { Bear } from '../models/bears.js';

export async function saveBears(entries: Bear[]): Promise<void> {
  const rows = entries.map((bear, position) => ({ ...bear, position }));

  await db.transaction(async (tx) => {
    await tx
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
    await tx.execute(sql`SELECT pg_notify('bears_changed', '')`);
  });
  onBearsChanged();
}
