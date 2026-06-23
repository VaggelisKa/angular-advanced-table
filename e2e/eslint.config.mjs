import baseConfig from '../eslint.config.base.mjs';

// Playwright specs. The `playwright` config (in base) self-scopes to *.e2e.ts.
// e2e is now an Nx project (project.json), so @nx/eslint infers a `lint` target
// here and these specs are covered by `nx run-many -t lint`.
export default baseConfig;
