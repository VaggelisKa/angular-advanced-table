import { recommended, vitest, playwright } from 'lint-suite/eslint';

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
      '.vscode/**',
      // Flat-config files: not part of any tsconfig project (projectService).
      '**/*.config*.mjs'
    ]
  },
  // recommended = base + javascript + typescript + json + boundaries + prettier.
  // vitest/playwright are rule-only and self-scope to spec/e2e files.
  ...recommended,
  ...vitest,
  ...playwright
];

// Temporary repo-wide rule overrides for Angular projects. Spread these LAST in
// each project's config (after `...angular`) so they win over the preset.
// TODO(lint-suite with angular v22 support): drop prefer-on-push override once the v22-compatible
// Angular ruleset lands; tracked alongside the angular-eslint@21/Angular22 gap.
export const angularOverrides = [
  {
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off'
    }
  }
];
