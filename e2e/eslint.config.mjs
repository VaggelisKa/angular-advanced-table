import baseConfig from '../eslint.config.base.mjs';

// Playwright specs. The `playwright` config (in base) self-scopes to *.e2e.ts.
// Note: e2e is not an Nx project, so this is for editor + manual `eslint e2e`,
// not `nx run-many -t lint`.
export default baseConfig;
