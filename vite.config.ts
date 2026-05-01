import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { jsxTemplatePlugin } from './vite-plugin-jsx-template';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

export default defineConfig({
  root: 'examples',
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
  optimizeDeps: {
    exclude: ['cocos-ui'],
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [projectRoot],
    },
  },
  plugins: [
    jsxTemplatePlugin({
      enabled: true,
    }),
  ],
});
