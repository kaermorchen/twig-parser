import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: true,
    setupFiles: [
      './build-parser.js',
    ],
    forceRerunTriggers: configDefaults.forceRerunTriggers.concat('twig.bnf')
  },
});
