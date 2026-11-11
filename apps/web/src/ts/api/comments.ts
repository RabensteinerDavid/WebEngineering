import { checkResponse } from './problem';
import { apiUrl } from './url';

export interface Comment {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}

function isComment(value: unknown): value is Comment {
  return (
    typeof value === 'object' &&
    value !== null &&
    ['id', 'bearId', 'author', 'text', 'createdAt'].every(
      (key) => key in value && typeof Reflect.get(value, key) === 'string'
    )
  );
}

export async function loadComments(
  bearId: string,
  signal: AbortSignal
): Promise<Comment[]> {
  const response = await fetch(
    apiUrl(`/api/bears/${encodeURIComponent(bearId)}/comments`),
    {
      signal,
    }
  );
  await checkResponse(response);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isComment)) {
    throw new Error('Invalid comment data.');
  }
  return data;
}

export async function addComment(
  bearId: string,
  author: string,
  text: string
): Promise<Comment> {
  const response = await fetch(
    apiUrl(`/api/bears/${encodeURIComponent(bearId)}/comments`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }
  );
  await checkResponse(response);
  const data: unknown = await response.json();
  if (!isComment(data)) throw new Error('Invalid comment data.');
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/comments/${encodeURIComponent(commentId)}`),
    {
      method: 'DELETE',
    }
  );
  await checkResponse(response);
}
