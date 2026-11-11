import { checkResponse } from './api/problem';
import { apiUrl } from './api/url';
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
  const response = await fetch(apiUrl(url), { signal: signal ?? null });
  await checkResponse(response);
  const data: unknown = await response.json();
  const bears: unknown = id === undefined ? data : [data];
  if (!Array.isArray(bears) || !bears.every(isBear))
    throw new Error('Invalid bear data received.');
  return bears;
}
