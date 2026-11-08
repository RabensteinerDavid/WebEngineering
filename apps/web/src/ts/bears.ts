import type { BearWithImage } from './models/bear';

export const PLACEHOLDER_IMAGE = '/media/placeholder.png';

function isBear(value: unknown): value is BearWithImage {
  if (typeof value !== 'object' || value === null) return false;
  return ['id', 'name', 'binomial', 'range', 'image'].every(
    (key) => key in value && typeof Reflect.get(value, key) === 'string'
  );
}

export async function loadBears(
  signal?: AbortSignal,
  id?: string
): Promise<BearWithImage[]> {
  const url =
    id === undefined ? '/api/bears' : `/api/bears/${encodeURIComponent(id)}`;
  const response = await fetch(url, { signal: signal ?? null });
  const notFound = 404;
  if (id !== undefined && response.status === notFound) return [];
  const data: unknown = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }
  const bears: unknown = id === undefined ? data : [data];
  if (!Array.isArray(bears) || !bears.every(isBear))
    throw new Error('Invalid bear data received.');
  return bears;
}

function getErrorMessage(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  )
    return data.message;
  return 'Could not load bears.';
}
