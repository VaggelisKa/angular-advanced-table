import { angular, angularTemplate, rxjs } from 'lint-suite/eslint';
import baseConfig from '../../eslint.config.base.mjs';

export default [...baseConfig, ...angular, ...angularTemplate, ...rxjs];
