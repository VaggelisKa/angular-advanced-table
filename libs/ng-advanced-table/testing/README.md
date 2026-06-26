# ng-advanced-table — testing contracts

Internal, **test-only** plain-TypeScript contract mirror for the `ng-advanced-table` package. Imported **only** by `*.spec.ts` files (via a relative path such as `../testing`) to drift-check production types against a canonical definition with `Equal<>`.

It is **never bundled or published**: nothing in any entry point's production source imports it, so ng-packagr (which builds each entry point from its `entryFile` import graph) never reaches it, and `tsconfig.lib.json` deliberately excludes this folder. Keep it that way — production code must not import from this `testing/` folder, or these contracts would leak into the published declarations.
