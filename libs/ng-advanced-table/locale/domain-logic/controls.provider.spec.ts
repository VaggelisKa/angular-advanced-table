import { provideZonelessChangeDetection } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NAT_TABLE_CONTROLS_INTL, provideNatTableControlsIntl, provideNatTableControlsLocales } from './controls.provider';
import { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';
import { NAT_EN_LOCALE_ID } from '../common/locale-id.const';
import { resolveNatTableControlsIntl } from '../utils/controls.util';

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

describe('FEATURE: companion components locale providers', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('GIVEN: provideNatTableControlsLocales() with no configuration', () => {
    beforeEach(() => {
      configure(provideNatTableControlsLocales());
    });

    describe('WHEN: injecting the components intl token', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES))('THEN: it registers the built-in locale %s', (localeId) => {
        expect(TestBed.inject(NAT_TABLE_CONTROLS_INTL).locales?.[localeId]).toBeDefined();
      });
    });
  });

  describe('GIVEN: a dictionary registered under a custom locale id', () => {
    beforeEach(() => {
      configure(provideNatTableControlsLocales({ qa: { toolbar: { toolbarLabel: 'QA toolbar' } } }));
    });

    describe('WHEN: resolving the custom id', () => {
      it('THEN: it uses the registered copy', () => {
        expect(resolveNatTableControlsIntl(TestBed.inject(NAT_TABLE_CONTROLS_INTL), 'qa').toolbar?.toolbarLabel).toBe('QA toolbar');
      });
    });

    describe('WHEN: resolving English', () => {
      it('THEN: it leaves the built-in English copy untouched', () => {
        expect(resolveNatTableControlsIntl(TestBed.inject(NAT_TABLE_CONTROLS_INTL), NAT_EN_LOCALE_ID).toolbar?.toolbarLabel).toBe(
          NAT_EN_CONTROLS_LOCALE_LABELS.toolbar?.toolbarLabel
        );
      });
    });
  });

  describe('GIVEN: provideNatTableControlsIntl() with a partial override', () => {
    beforeEach(() => {
      configure(provideNatTableControlsIntl({ toolbar: { toolbarLabel: 'Provider toolbar' } }));
    });

    describe('WHEN: resolving English', () => {
      it('THEN: the override wins over the built-in dictionary', () => {
        expect(resolveNatTableControlsIntl(TestBed.inject(NAT_TABLE_CONTROLS_INTL), NAT_EN_LOCALE_ID).toolbar?.toolbarLabel).toBe(
          'Provider toolbar'
        );
      });

      it('THEN: fields the override leaves out keep the built-in copy', () => {
        expect(resolveNatTableControlsIntl(TestBed.inject(NAT_TABLE_CONTROLS_INTL), NAT_EN_LOCALE_ID).search?.label).toBe(
          NAT_EN_CONTROLS_LOCALE_LABELS.search?.label
        );
      });
    });
  });
});
