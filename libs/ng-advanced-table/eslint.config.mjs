import { angular, angularTemplate, rxjs, boundaries } from 'lint-suite/eslint';

import baseConfig, { angularOverrides } from '../../eslint.config.base.mjs';

export default [...baseConfig, ...angular, ...angularTemplate, ...rxjs, ...boundaries, ...angularOverrides];
