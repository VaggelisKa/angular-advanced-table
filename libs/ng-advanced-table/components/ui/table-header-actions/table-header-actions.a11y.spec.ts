import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { root } from '../../test-helpers/table-dom.helper';
import {
  CustomSortIndicatorHost,
  HiddenHeaderActionLabelHost,
  MoveOnlyHeaderActionsHost
} from '../../test-helpers/table-header-hosts.helper';
import { TableHost } from '../../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable UI - Header Actions A11y', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost, CustomSortIndicatorHost, MoveOnlyHeaderActionsHost, HiddenHeaderActionLabelHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
  });

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: keyboard navigation is used in a header cell', () => {
      it('THEN: it renders no grid-cell widget and manages the header controls out of the tab order', () => {
        fixture.detectChanges();

        const header = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;
        const headerContent = header.querySelector('.header-content') as HTMLElement;
        const sortButton = header.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = header.querySelector('.menu-button') as HTMLButtonElement;

        // No ngGridCellWidget wrapper: the unregistered widget still self-assigns
        // tabindex="0" while its cell is active, adding a focus stop between the
        // cell and its controls that swallows Tab.
        expect(header.querySelectorAll('[ngGridCellWidget]')).toHaveLength(0);
        expect(headerContent.hasAttribute('tabindex')).toBe(false);
        expect(sortButton.tabIndex).toBe(-1);
        expect(sortButton.hasAttribute('data-nat-table-managed-cell-widget')).toBe(true);
        expect(menuButton.tabIndex).toBe(-1);
        expect(menuButton.hasAttribute('data-nat-table-managed-cell-widget')).toBe(true);

        header.focus();
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(sortButton);

        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(menuButton);

        menuButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(sortButton);

        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(header);
      });
    });

    describe('WHEN: the table with a hidden header label renders', () => {
      it('THEN: it keeps header action controls visible when the header label is hidden', () => {
        const hiddenFixture = TestBed.createComponent(HiddenHeaderActionLabelHost);

        hiddenFixture.detectChanges();

        const nameHeader = root(hiddenFixture).querySelector('thead th[data-column-id="name"]') as HTMLElement;
        const headerLabel = nameHeader.querySelector('.header-label') as HTMLElement;
        const sortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

        expect(headerLabel.classList.contains('sr-only')).toBe(true);
        expect(headerLabel.textContent.trim()).toBe('Row actions');
        expect(sortButton).toBeTruthy();
        expect(menuButton).toBeTruthy();
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Row actions');
        expect(menuButton.getAttribute('aria-label')).toBe('Row actions column actions');

        hiddenFixture.destroy();
      });
    });

    describe('WHEN: the header actions stylesheet is registered', () => {
      // Emulated encapsulation appends `[_ngcontent-…]` to each selector, so
      // match the authored class at the start of the rule text instead.
      const cssRuleTexts = (): string[] =>
        Array.from(document.styleSheets)
          .flatMap((styleSheet) => Array.from(styleSheet.cssRules))
          .map((rule) => rule.cssText.replaceAll(/\s+/gu, ' '));

      it('THEN: it keeps the sort control at the 24px minimum target size', () => {
        fixture.detectChanges();

        const sortButtonRule = cssRuleTexts().find((cssText) => /^\.sort-button\[[^\]]+\] \{/u.test(cssText)) ?? '';

        // WCAG 2.5.8 (AA) target size: 24 x 24 CSS px.
        expect(sortButtonRule).toContain('min-inline-size: 24px');
        expect(sortButtonRule).toContain('min-block-size: 24px');
      });

      it('THEN: it aligns end labels and menu items with logical values that follow the table direction', () => {
        fixture.detectChanges();

        const rules = cssRuleTexts();
        const endLabelRule =
          rules.find((cssText) => cssText.startsWith('.header-content.is-align-end') && cssText.includes('.header-label')) ?? '';
        const menuItemRule = rules.find((cssText) => /^\.column-menu-item\[[^\]]+\] \{/u.test(cssText)) ?? '';

        expect(endLabelRule).toContain('text-align: end');
        expect(menuItemRule).toContain('text-align: start');
      });

      it('THEN: it drops the menu enter animation and control transitions under reduced motion', () => {
        fixture.detectChanges();

        const reducedMotionCss = Array.from(document.styleSheets)
          .flatMap((styleSheet) => Array.from(styleSheet.cssRules))
          .filter(
            (rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && rule.media.mediaText.includes('prefers-reduced-motion')
          )
          .map((rule) => rule.cssText.replaceAll(/\s+/gu, ' '))
          .join('\n');

        expect(reducedMotionCss).toMatch(/\.column-menu\[[^\]]+\] \{ animation: none;/u);

        for (const selector of [
          '.sort-button',
          '.menu-button',
          '.nat-default-sort__up',
          '.column-menu-item',
          '.column-menu-item__check'
        ]) {
          expect(reducedMotionCss).toContain(selector);
        }

        expect(reducedMotionCss).toMatch(/\.column-menu-item__check\[[^\]]+\] \{ transition: none;/u);
      });
    });
  });
});
