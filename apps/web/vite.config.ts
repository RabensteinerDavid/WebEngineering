import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/metrics': { target: process.env.API_URL ?? 'http://localhost:3000' },
      '/api': {
        target: process.env.API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => (path === '/api/health' ? '/health' : path),
      },
    },
  },
});
