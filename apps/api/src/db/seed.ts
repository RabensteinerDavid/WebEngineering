import { readFile } from 'node:fs/promises';
import { pool } from './client.js';
import { bearSchema } from '../models/bears.js';
import { saveBears } from './save-bears.js';

try {
  const json = await readFile(
    new URL('../../fixtures/bears.json', import.meta.url),
    'utf8'
  );
  const entries = bearSchema.array().nonempty().parse(JSON.parse(json));
  await saveBears(entries);
} finally {
  await pool.end();
}
