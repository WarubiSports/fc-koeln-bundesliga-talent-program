import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      outdir: 'dist',
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      minify: true,
      external: [
        'bufferutil',
        'utf-8-validate'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    console.log('Server build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildServer();
