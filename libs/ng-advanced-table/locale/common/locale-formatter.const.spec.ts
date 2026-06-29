import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';

describe('FEATURE: shared default number formatter', () => {
  describe('GIVEN: the default locale-aware number formatter', () => {
    describe('WHEN: formatting with an explicit locale', () => {
      const intl = DEFAULT_NUMBER_FORMATTER(1234.5, undefined, 'en-US');

      it('THEN: it uses the locale-specific separators', () => {
        expect(intl).toBe('1,234.5');
      });
    });

    describe('WHEN: a different locale is supplied', () => {
      const intl = DEFAULT_NUMBER_FORMATTER(1234.5, undefined, 'de-DE');

      it('THEN: it uses the locale-specific separators', () => {
        expect(intl).toBe('1.234,5');
      });
    });

    describe('WHEN: formatting options are supplied', () => {
      const intl = DEFAULT_NUMBER_FORMATTER(1234.5, { maximumFractionDigits: 0 }, 'en-US');

      it('THEN: it passes the options through to Intl', () => {
        expect(intl).toBe('1,235');
      });
    });
  });
});
