import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ListHost } from '../test-helpers/list-hosts.helper';

describe('FEATURE: NatList styling tokens', () => {
  let fixture: ComponentFixture<ListHost>;

  const render = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListHost);
  });

  describe('GIVEN: a list rendered inside a table surface', () => {
    describe('WHEN: the list styles are loaded', () => {
      it('THEN: it drives the last item of each group from the group-last-item token, falling back to the item border', async () => {
        await render();

        const listStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const groupLastRule = listStyles.find((rule) => rule.cssText.includes('--nat-list-group-last-item-border-width'));

        const cssText = groupLastRule?.cssText.replaceAll(/\s+/gu, ' ') ?? '';

        expect(groupLastRule?.selectorText).toContain('.list-item');
        expect(groupLastRule?.selectorText).toContain('.list-row');
        expect(groupLastRule?.selectorText).toContain(':has(+ .list-sub-header');
        expect(cssText).toContain('border-width: var( --nat-list-group-last-item-border-width');
        expect(cssText).toContain('var(--nat-list-item-border-width, var(--sys-nat-table-list-item-border-width, 1px))');
      });

      it('THEN: it fills the sub-header row and lays the content out from the sub-header content tokens', async () => {
        await render();

        const listStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const contentRule = listStyles.find((rule) => rule.cssText.includes('--nat-list-sub-header-content-display'));

        const cssText = contentRule?.cssText.replaceAll(/\s+/gu, ' ') ?? '';

        expect(cssText).toContain('flex: 1 1 auto');
        expect(cssText).toContain(
          'display: var(--nat-list-sub-header-content-display, var(--sys-nat-table-list-sub-header-content-display, block))'
        );
        expect(cssText).toContain('grid-template-columns: var( --nat-list-sub-header-columns');
        expect(cssText).toContain('var(--nat-list-item-columns, var(--sys-nat-table-list-item-columns, 1fr))');
        expect(cssText).toContain('var(--nat-list-item-gap, var(--sys-nat-table-list-item-gap, 0.25rem))');
        expect(cssText).toContain('--nat-list-sub-header-content-align');
        expect(cssText).toContain('--nat-list-sub-header-content-justify');
      });

      it('THEN: it aligns the fields of one item from the item align token, stretched by default', async () => {
        await render();

        const listStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const fieldsRule = listStyles.find((rule) => rule.cssText.includes('--nat-list-item-align'));

        expect(fieldsRule?.selectorText).toContain('.list-item-fields');
        expect(fieldsRule?.cssText).toContain(
          'align-items: var(--nat-list-item-align, var(--sys-nat-table-list-item-align, stretch))'
        );
      });
    });
  });
});
