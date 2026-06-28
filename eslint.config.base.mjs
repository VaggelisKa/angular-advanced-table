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
  ...playwright,
  {
    // Entry-point layering for the consolidated `ng-advanced-table` package.
    // Each subpath (`.`, `/components`, `/render-metrics`, `/locale`) is its own Nx
    // project; this guards which subpath may import which. Confirmed against the real
    // Nx graph (#185), matching the documented policy in AGENTS.md: core must NOT
    // import the companions (components/render-metrics); both companions may compose
    // core; locale is the leaf (imported by all, imports none).
    // `type:public-api` is the build-only wrapper project; the bare
    // `ng-advanced-table` specifier resolves to it as well as to core, so every
    // entry point is allowed to "see" it.
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
            { sourceTag: 'type:e2e', onlyDependOnLibsWithTags: ['type:app'] },
            { sourceTag: 'type:public-api', onlyDependOnLibsWithTags: ['*'] },
            {
              // Companion entry point (/components): may compose core + the locale leaf.
              sourceTag: 'type:components',
              onlyDependOnLibsWithTags: ['type:core', 'type:locale', 'type:public-api']
            },
            {
              // Core must NOT import the companions; locale leaf only.
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:locale', 'type:public-api']
            },
            {
              // Companion entry point (/render-metrics): may compose core + the locale leaf.
              sourceTag: 'type:render-metrics',
              onlyDependOnLibsWithTags: ['type:core', 'type:locale', 'type:public-api']
            },
            { sourceTag: 'type:locale', onlyDependOnLibsWithTags: [] }
          ]
        }
      ]
    }
  }
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
