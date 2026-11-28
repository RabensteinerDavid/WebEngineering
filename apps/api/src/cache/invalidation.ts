import { pool } from '../db/client.js';
import { onBearsChanged } from './bears-cache.js';

const failureExitCode = 1;

// Seed and refresh run in different processes, so use PostgreSQL to signal changes.
export async function listenForBearChanges(): Promise<void> {
  const connection = await pool.connect();
  connection.on('notification', () => {
    onBearsChanged();
  });
  connection.on('error', (error) => {
    onBearsChanged();
    process.stderr.write(
      `Cache invalidation connection lost: ${error.message}\n`
    );
    // Restart rather than serving cached data without invalidation notifications.
    process.exit(failureExitCode);
  });
  await connection.query('LISTEN bears_changed');
}
