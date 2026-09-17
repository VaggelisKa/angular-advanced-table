import { angular, angularTemplate, rxjs, boundaries } from 'lint-suite/eslint';

import baseConfig, { angularOverrides } from '../../eslint.config.base.mjs';

export default [
  ...baseConfig,
  ...angular,
  ...angularTemplate,
  ...rxjs,
  ...boundaries,
  ...angularOverrides,
  {
    // Locale dictionaries are data that most applications never register. An
    // object spread is not provably side-effect free (it can trigger getters),
    // so a bundler keeps any dictionary built with one — measured at 45.4 kB of
    // locale code retained by an English-only app, against 13.8 kB without.
    // Compose from named exports instead; see locale/common/*-list.const.ts.
    files: ['**/locale/common/*.const.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ObjectExpression > SpreadElement',
          message:
            'Object spread pins this dictionary into every consumer bundle. Export the parts individually and reference them by name.'
        }
      ]
    }
  }
];
