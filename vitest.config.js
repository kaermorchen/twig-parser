import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: true,
    forceRerunTriggers: configDefaults.forceRerunTriggers.concat(
      'twig.jison',
      './tests/**',
      './src/**'
    ),
    deps: {
      inline: [
        "jison-gho"
      ]
    }
  },
});
