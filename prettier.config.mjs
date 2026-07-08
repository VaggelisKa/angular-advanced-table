import { prettier } from 'lint-suite/prettier';

export default {
  ...prettier,
  overrides: [
    ...prettier.overrides,
    { files: '*.html', options: { parser: 'angular' } },
    { files: 'index.html', options: { parser: 'html' } }
  ]
};
