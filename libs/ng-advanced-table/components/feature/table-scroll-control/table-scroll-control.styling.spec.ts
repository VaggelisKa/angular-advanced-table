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

        // Stock size: a 24px arrow inside a 36px square button with no inline padding, and a 44px hit area (WCAG 2.5.5 AAA).
        const buttonRule = cssRules.find((cssText) => /^\.scroll-button[[\s{]/.test(cssText)) ?? '';
        const iconRule = cssRules.find((cssText) => /^\.scroll-icon[[\s{]/.test(cssText)) ?? '';

        expect(buttonRule).toMatch(/min-inline-size:[^;]*--sys-nat-table-scroll-button-min-height, 36px/);
        expect(buttonRule).toMatch(/min-block-size:[^;]*--sys-nat-table-scroll-button-min-height, 36px/);
        expect(buttonRule).toMatch(/padding:[^;]*--sys-nat-table-scroll-button-padding-x, 0\)/);
        expect(iconRule).toMatch(/width:[^;]*--sys-nat-table-scroll-icon-size, 24px/);

        const hitAreaRule = cssRules.find((cssText) => /^\.scroll-button[[\s]*[^{]*::before/.test(cssText)) ?? '';

        expect(hitAreaRule).toMatch(/position: absolute/);
        expect(hitAreaRule).toMatch(/--sys-nat-table-scroll-button-target-size,\s*44px/);
        expect(hitAreaRule).toMatch(/inset-inline: calc\(min\(0px, \(var\(--sys-nat-table-scroll-button-box-inline\)/);
        expect(hitAreaRule).toMatch(/inset-block: calc\(min\(0px, \(var\(--sys-nat-table-scroll-button-box-block\)/);
        expect(hitAreaRule).toMatch(/--sys-nat-table-scroll-button-box-inline: var\(--nat-table-scroll-button-min-inline-size,/);
        expect(hitAreaRule).toMatch(/--sys-nat-table-scroll-button-box-block: var\(--nat-table-scroll-button-min-block-size,/);
        expect(iconRule).toMatch(/height:[^;]*--sys-nat-table-scroll-icon-size, 24px/);
        expect(ruleUsesToken('.scroll-range-label', '--nat-table-scroll-position-min-inline-size')).toBe(true);
        expect(ruleUsesToken('.scroll-range-label', '--nat-table-scroll-range-min-inline-size')).toBe(true);
        expect(ruleUsesToken('::-webkit-slider-thumb', '--nat-table-scroll-range-thumb-color')).toBe(true);
        expect(ruleUsesToken('::-webkit-slider-runnable-track', '--nat-table-scroll-range-track-color')).toBe(true);
      });
    });
  });
});
