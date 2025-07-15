import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Fixed vite config without top-level await
export default defineConfig(async () => {
  // Move the async logic inside the function
  const { db } = await import('./server/db');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
        '@assets': path.resolve(__dirname, './client/public'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'client/dist',
      rollupOptions: {
        input: path.resolve(__dirname, './client/index.html'),
      },
    },
  };
});