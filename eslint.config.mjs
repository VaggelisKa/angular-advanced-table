import { recommended, angular, angularTemplate, rxjs, vitest, playwright } from 'lint-suite/eslint';

export default [
  {
    // Build output + tool/state dirs. Mirrors .gitignore (flat config only
    // auto-ignores node_modules and .git).
    ignores: [
      'dist/**',
      'tmp/**',
      'out-tsc/**',
      'bazel-out/**',
      '.angular/**',
      '.nx/**',
      'coverage/**',
      'test-results/**',
      'public/**',
      '.omc/**',
      '.codex/**',
      '**/*.d.ts',
      // Comment-bearing config JSON — lint-suite's json config parses these as
      // strict JSON (fatal on `//` and `/* */`). Prettier still formats them.
      '**/tsconfig*.json',
      '.vscode/**',
      // Root flat-config files: not part of any tsconfig project (projectService).
      'eslint.config.mjs',
      'prettier.config.mjs'
    ]
  },
  // recommended = base + javascript + typescript + json + boundaries + prettier (prettier last).
  // The framework configs below are rule-only and self-scoped by file glob, so appending
  // them after `recommended` is safe (per lint-suite README).
  ...recommended,
  ...angular,
  ...angularTemplate,
  ...rxjs,
  ...vitest,
  ...playwright
];
