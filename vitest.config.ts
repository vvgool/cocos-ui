import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { jsxTemplatePlugin } from './vite-plugin-jsx-template';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'cocos-ui',
  },
  resolve: {
    alias: [
      { find: 'cocos-ui/jsx-dev-runtime', replacement: resolve(projectRoot, 'src/core/jsx-runtime.ts') },
      { find: 'cocos-ui/jsx-runtime', replacement: resolve(projectRoot, 'src/core/jsx-runtime.ts') },
      { find: 'cocos-ui', replacement: resolve(projectRoot, 'src/index.ts') },
    ],
  },
  plugins: [
    jsxTemplatePlugin({
      enabled: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'examples'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**'],
    },
  },
});
