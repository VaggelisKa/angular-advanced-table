import baseConfig from '../eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    // `expectNoAxeViolations` (e2e/support/axe.ts) wraps the axe-core assertion, so a
    // test whose only assertion is an axe scan still asserts. Register it so
    // playwright/expect-expect recognizes it (keep the built-in `expect` too).
    files: ['**/*.e2e.ts'],
    rules: {
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['expect', 'expectNoAxeViolations'] }]
    }
  }
];
