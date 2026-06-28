import { angular, angularTemplate, rxjs } from 'lint-suite/eslint';

import baseConfig, { angularOverrides } from '../../eslint.config.base.mjs';

// Deliberate element-layer map for this package's subpath entry points (#185).
// Each entry point (`.`/src, /components, /render-metrics, /locale) is organized into
// element folders: common (types/consts/i18n-data) < utils (pure fns) < domain-logic
// (stateful services) / data-access < ui (presentational) < feature (composers).
// eslint-plugin-boundaries resolves the DEEPEST matching element folder, so a file
// under <entry>/<element>/** is typed by its element (e.g. components/feature/* =>
// `feature`), NOT by the entry-point folder name. The entry folder names never alias
// an element name (since /ui and /utils were renamed), so the entry barrels sit
// unmatched. Re-declared locally (identical to the lint-suite defaults) to make the
// map explicit, document the deepest-wins reliance, and pin it against upstream drift.
const elementLayering = [
  {
    files: ['**/*.ts'],
    settings: {
      'boundaries/elements': [
        { type: 'feature', pattern: '**/feature/**' },
        { type: 'data-access', pattern: '**/data-access/**' },
        { type: 'domain-logic', pattern: '**/domain-logic/**' },
        { type: 'ui', pattern: '**/ui/**' },
        { type: 'common', pattern: '**/common/**' },
        { type: 'utils', pattern: '**/utils/**' }
      ]
    }
  },
  {
    // Spec files cross layers for integration tests, so they do not participate in the
    // production layer graph. (Entry barrels need no exemption: their folder names
    // `components`/`render-metrics`/`src`/`locale` match no element pattern, so they
    // sit unmatched and unchecked.)
    files: ['**/*.spec.ts'],
    rules: { 'boundaries/dependencies': 'off' }
  }
];

export default [...baseConfig, ...angular, ...angularTemplate, ...rxjs, ...angularOverrides, ...elementLayering];
