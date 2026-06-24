import { angular, angularTemplate, rxjs } from 'lint-suite/eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import baseConfig, { angularOverrides } from '../../eslint.config.base.mjs';

const configDir = dirname(fileURLToPath(import.meta.url));

export default [
  ...baseConfig,
  ...angular,
  ...angularTemplate,
  ...rxjs,
  ...angularOverrides,
  {
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: join(configDir, 'tsconfig.spec.json')
        })
      ]
    }
  }
];
