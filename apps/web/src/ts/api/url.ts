// Empty by default: use the Vite/Nginx proxy. Set VITE_API_URL for the CORS test.
export function apiUrl(path: string): string {
  return `${import.meta.env.VITE_API_URL ?? ''}${path}`;
}
