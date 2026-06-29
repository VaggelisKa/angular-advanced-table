import { resolveNatTableControlsIntl } from './controls.util';
import { NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';

describe('FEATURE: controls intl merge', () => {
  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      it('THEN: it falls back to built-in English toolbar copy', () => {
        const resolved = resolveNatTableControlsIntl({ locales: NAT_TABLE_BUILT_IN_CONTROLS_LOCALES }, 'zz');

        // then: English default toolbar label is used
        expect(resolved.toolbar?.toolbarLabel).toBe('Table toolbar');
      });
    });
  });
});
