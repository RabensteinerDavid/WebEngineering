import { loadWikipediaBears } from '../services/wikipedia-service.js';
import { saveBears } from './save-bears.js';
import { pool } from './client.js';

try {
  await saveBears(await loadWikipediaBears());
} finally {
  await pool.end();
}
