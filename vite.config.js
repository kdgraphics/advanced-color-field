import {defineConfig} from 'vite';
import {resolve} from 'node:path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'src/resources/dist'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        input: resolve(__dirname, 'src/resources/src/input/main.js'),
        settings: resolve(__dirname, 'src/resources/src/settings/main.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name].css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
