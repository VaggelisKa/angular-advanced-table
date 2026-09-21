import { resolveNatTableControlsIntl } from './controls.util';
import { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';
import type { NatTableControlsIntl } from '../common/controls.type';
import { expectDefined } from '../test-helpers/locale-copy.helper';
import { SHIPPED_CONTROLS_LOCALES } from '../test-helpers/shipped-locales.helper';

const shippedLocaleIds = Object.keys(SHIPPED_CONTROLS_LOCALES);
const englishToolbar = expectDefined(NAT_EN_CONTROLS_LOCALE_LABELS.toolbar, 'English toolbar copy');

const resolveShipped = (localeId: string): NatTableControlsIntl =>
  resolveNatTableControlsIntl({ locales: SHIPPED_CONTROLS_LOCALES }, localeId);

describe('FEATURE: controls locale resolution', () => {
  describe('GIVEN: every shipped dictionary registered under its own id', () => {
    describe('WHEN: resolving a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s resolves to the dictionary registered under it', (localeId) => {
        const expected = SHIPPED_CONTROLS_LOCALES[localeId];
        const resolved = resolveShipped(localeId);

        expect(resolved.toolbar).toStrictEqual(expected.toolbar);
        expect(resolved.search).toStrictEqual(expected.search);
        expect(resolved.headerActions).toStrictEqual(expected.headerActions);
      });
    });

    describe('WHEN: resolving a region-tagged variant of a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s-ZZ resolves to the base dictionary', (localeId) => {
        expect(resolveShipped(`${localeId}-ZZ`).toolbar).toStrictEqual(SHIPPED_CONTROLS_LOCALES[localeId].toolbar);
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableControlsIntl({ locales: NAT_TABLE_BUILT_IN_CONTROLS_LOCALES }, 'zz');

      it('THEN: it falls back to the registered English copy', () => {
        expect(resolved.toolbar).toStrictEqual(englishToolbar);
      });
    });

    describe('WHEN: the registry holds no English entry either', () => {
      const resolved = resolveNatTableControlsIntl({ locales: {} }, 'zz');

      it('THEN: it falls back to the built-in English copy', () => {
        expect(resolved.toolbar).toStrictEqual(englishToolbar);
      });
    });
  });
});
