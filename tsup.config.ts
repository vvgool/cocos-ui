import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  clean: true,
});
