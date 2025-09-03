import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',             // where your index.html is
  build: {
    outDir: '../client-dist', // put build output in client-dist
    emptyOutDir: true,        // clear old files before building
  },
});
