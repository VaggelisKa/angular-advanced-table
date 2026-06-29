import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';

describe('FEATURE: shared default number formatter', () => {
  describe('GIVEN: the default locale-aware number formatter', () => {
    describe('WHEN: formatting with an explicit locale', () => {
      it('THEN: it groups and separates digits for that locale', () => {
        // when: formatting in en-US
        // then: it uses comma grouping and a dot decimal
        expect(DEFAULT_NUMBER_FORMATTER(1234.5, undefined, 'en-US')).toBe('1,234.5');
      });
    });

    describe('WHEN: a different locale is supplied', () => {
      it('THEN: it honors that locale separators', () => {
        // when: formatting in de-DE
        // then: it swaps to dot grouping and a comma decimal
        expect(DEFAULT_NUMBER_FORMATTER(1234.5, undefined, 'de-DE')).toBe('1.234,5');
      });
    });

    describe('WHEN: formatting options are supplied', () => {
      it('THEN: it passes the options through to Intl', () => {
        // when: capping fraction digits to zero
        // then: the value is rounded
        expect(DEFAULT_NUMBER_FORMATTER(1234.5, { maximumFractionDigits: 0 }, 'en-US')).toBe('1,235');
      });
    });
  });
});
