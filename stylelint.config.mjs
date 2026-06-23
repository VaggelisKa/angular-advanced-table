import { stylelint } from 'lint-suite/stylelint';

// Stylelint preset = lint-suite's CSS/SCSS config (standard + recess-order +
// BEM) plus the Angular-selector allowances this workspace needs. Prettier
// still owns whitespace/formatting; stylelint-config-standard (v15+) dropped
// stylistic rules, so the two don't fight.
export default {
  ...stylelint,
  // lint-suite ships an overrides-only config (no top-level `rules`). Stylelint
  // resolves a root config before matching overrides and errors with "No rules
  // found" on an empty root, so give it an empty rule set to satisfy that.
  rules: {},
  ignoreFiles: ['**/dist/**', '**/nx/**', '**/coverage/**', '**/node_modules/**'],
  overrides: [
    ...stylelint.overrides,
    {
      files: ['**/*.css', '**/*.scss'],
      rules: {
        // Angular view-encapsulation selectors are not in the standard known
        // lists. `:host`/`:host-context` already pass; `::ng-deep` and the
        // `<markdown>` element selector (ngx-markdown) need explicit allows.
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['ng-deep'] }],
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['host', 'host-context', 'ng-deep'] }],
        'selector-type-no-unknown': [true, { ignore: ['custom-elements'], ignoreTypes: ['markdown'] }]
      }
    }
  ]
};
