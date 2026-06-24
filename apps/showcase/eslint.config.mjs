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
    // The showcase imports workspace packages that may not have dist output yet
    // when Nx runs affected lint/build tasks in parallel. Resolve those imports
    // through source paths so import-x linting is independent of package build order.
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
