import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NatTableService } from 'ng-advanced-table';

import { NatTableScrollControl } from './table-scroll-control';

describe('FEATURE: table scroll control styling contract', () => {
  describe('GIVEN: the scroll control stylesheet is registered', () => {
    describe('WHEN: inherited public theme hooks are inspected', () => {
      it('THEN: it exposes layout, icon, and WebKit range tokens with cross-engine forced-color rules', async () => {
        await TestBed.configureTestingModule({
          imports: [NatTableScrollControl],
          providers: [provideZonelessChangeDetection(), NatTableService]
        }).compileComponents();

        const fixture = TestBed.createComponent(NatTableScrollControl);

        await fixture.whenStable();

        const cssRules = Array.from(document.styleSheets)
          .flatMap((styleSheet) => Array.from(styleSheet.cssRules))
          .map((rule) => rule.cssText);
        const ruleUsesToken = (selector: string, token: string): boolean =>
          cssRules.some((cssText) => cssText.includes(selector) && new RegExp(`var\\(\\s*${token}`).test(cssText));
        const forcedColorsRule = cssRules.find((cssText) => cssText.includes('@media') && cssText.includes('forced-colors: active'));
        const forcedColorsCss = forcedColorsRule?.toLowerCase() ?? '';

        expect(forcedColorsCss).toContain('canvas');
        expect(forcedColorsCss).toContain('canvastext');
        expect(forcedColorsCss).toContain('highlight');
        expect(forcedColorsCss).toContain('::-webkit-slider-runnable-track');
        expect(forcedColorsCss).toContain('::-webkit-slider-thumb');
        expect(forcedColorsCss).toContain('::-moz-range-track');
        expect(forcedColorsCss).toContain('::-moz-range-progress');
        expect(forcedColorsCss).toContain('::-moz-range-thumb');
        expect(ruleUsesToken('.scroll-icon', '--nat-table-scroll-icon-size')).toBe(true);
        expect(ruleUsesToken('.scroll-range-label', '--nat-table-scroll-position-min-inline-size')).toBe(true);
        expect(ruleUsesToken('.scroll-range-label', '--nat-table-scroll-range-min-inline-size')).toBe(true);
        expect(ruleUsesToken('::-webkit-slider-thumb', '--nat-table-scroll-range-thumb-color')).toBe(true);
        expect(ruleUsesToken('::-webkit-slider-runnable-track', '--nat-table-scroll-range-track-color')).toBe(true);
      });
    });
  });
});
