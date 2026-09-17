import { matchNatTableLocaleId } from './locale-lookup.util';

describe('FEATURE: locale id lookup', () => {
  const locales = { en: {}, da: {}, 'da-DK': {}, 'zh-Hant': {} };

  describe('GIVEN: a registry holding both a base language and a region-tagged id', () => {
    describe('WHEN: matching an id that is registered exactly', () => {
      it('THEN: the exact entry wins over the base language', () => {
        expect(matchNatTableLocaleId(locales, 'da-DK')).toBe('da-DK');
      });
    });

    describe('WHEN: matching an unregistered region of a registered language', () => {
      it('THEN: it truncates to the base language', () => {
        expect(matchNatTableLocaleId(locales, 'da-GL')).toBe('da');
      });

      it('THEN: it keeps a registered script subtag before truncating further', () => {
        expect(matchNatTableLocaleId(locales, 'zh-Hant-TW')).toBe('zh-Hant');
      });

      it('THEN: it skips a singleton subtag that can never match a language', () => {
        expect(matchNatTableLocaleId(locales, 'da-DK-u-co-phonebk')).toBe('da-DK');
      });
    });

    describe('WHEN: matching an unregistered language', () => {
      it('THEN: it reports no match rather than a near one', () => {
        expect(matchNatTableLocaleId(locales, 'sv-SE')).toBeNull();
      });
    });
  });

  describe('GIVEN: no registry at all', () => {
    describe('WHEN: matching a well-formed id', () => {
      it('THEN: it reports no match instead of throwing', () => {
        expect(matchNatTableLocaleId(undefined, 'da')).toBeNull();
      });
    });
  });
});
