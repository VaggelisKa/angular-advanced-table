import {
  hiddenColumnContext,
  pageSizeContext,
  pinnedHeaderContext,
  soleSortedHeaderContext,
  sortedHeaderContext,
  unpinnedHeaderContext,
  unsortedHeaderContext,
  visibleColumnContext
} from '../test-helpers/controls-contexts.helper';
import { SHIPPED_CONTROLS_LOCALES } from '../test-helpers/shipped-locales.helper';

describe('FEATURE: natural Nordic control announcements', () => {
  describe('GIVEN: the Nordic control dictionaries', () => {
    describe('WHEN: announcing pinning and unpinning inside the named menu', () => {
      it.each([
        ['da', 'Fastgør til venstre', 'Frigør fra højre'],
        ['sv', 'Fäst till vänster', 'Lossa från höger'],
        ['nb', 'Fest til venstre', 'Løsne fra høyre'],
        ['fi', 'Kiinnitä vasemmalle', 'Irrota oikealta']
      ])('THEN: it retains the action and direction in %s', (localeId, pinned, unpinned) => {
        const labels = SHIPPED_CONTROLS_LOCALES[localeId].headerActions?.accessibilityLabels;

        expect(labels?.pinButton?.(unpinnedHeaderContext)).toBe(pinned);
        expect(labels?.pinButton?.(pinnedHeaderContext)).toBe(unpinned);
      });
    });

    describe('WHEN: announcing column visibility', () => {
      it.each([
        ['da', 'Service, vist', 'Service, skjult'],
        ['sv', 'Service, synlig', 'Service, dold'],
        ['nb', 'Service, vist', 'Service, skjult'],
        ['fi', 'Service, näkyvissä', 'Service, piilotettu']
      ])('THEN: it retains the visible state word in %s', (localeId, visible, hidden) => {
        const labels = SHIPPED_CONTROLS_LOCALES[localeId].columnVisibility?.accessibilityLabels;

        expect(labels?.toggleColumnAriaLabel?.(visibleColumnContext)).toBe(visible);
        expect(labels?.toggleColumnAriaLabel?.(hiddenColumnContext)).toBe(hidden);

        for (const context of [visibleColumnContext, hiddenColumnContext]) {
          expect(labels?.toggleColumnAriaLabel?.(context).toLocaleLowerCase(localeId)).toContain(
            labels?.columnState?.(context).toLocaleLowerCase(localeId)
          );
        }
      });
    });

    describe('WHEN: sorting a column', () => {
      it.each([
        [
          'da',
          'Sortér efter Service',
          'Sortér efter Service, sorteret stigende, sortering 1 af 2',
          'Sortér efter Service, sorteret faldende'
        ],
        [
          'sv',
          'Sortera efter Service',
          'Sortera efter Service, stigande sortering, sortering 1 av 2',
          'Sortera efter Service, fallande sortering'
        ],
        [
          'nb',
          'Sorter etter Service',
          'Sorter etter Service, sortert stigende, sortering 1 av 2',
          'Sorter etter Service, sortert synkende'
        ],
        [
          'fi',
          'Lajittele sarakkeen Service mukaan',
          'Lajittele sarakkeen Service mukaan, lajiteltu nousevasti, lajittelu 1 / 2',
          'Lajittele sarakkeen Service mukaan, lajiteltu laskevasti'
        ]
      ])('THEN: it keeps the action, direction and priority in %s', (localeId, unsorted, multiple, single) => {
        const labels = SHIPPED_CONTROLS_LOCALES[localeId].headerActions?.accessibilityLabels;

        expect(labels?.sortButton?.(unsortedHeaderContext)).toBe(unsorted);
        expect(labels?.sortButton?.(sortedHeaderContext)).toBe(multiple);
        expect(labels?.sortButton?.(soleSortedHeaderContext)).toBe(single);
        expect(labels?.sortButton?.({ ...soleSortedHeaderContext, sortPriority: null, sortCount: 2 })).toBe(single);
      });
    });

    describe('WHEN: choosing a page size', () => {
      it.each([
        ['da', ['0 rækker', '1 række', '2 rækker', '21 rækker']],
        ['sv', ['0 rader', '1 rad', '2 rader', '21 rader']],
        ['nb', ['0 rader', '1 rad', '2 rader', '21 rader']],
        ['fi', ['0 riviä', '1 rivi', '2 riviä', '21 riviä']]
      ] as const)('THEN: it uses the same inflected count for visible and accessible text in %s', (localeId, expected) => {
        const labels = SHIPPED_CONTROLS_LOCALES[localeId].pageSize?.accessibilityLabels;

        [0, 1, 2, 21].forEach((count, index) => {
          const context = { ...pageSizeContext, pageSizeValue: count, pageSizeText: String(count) };

          expect(labels?.pageSizeOptionText?.(context)).toBe(expected[index]);
          expect(labels?.pageSizeOptionAriaLabel?.(context)).toBe(expected[index]);
        });
      });
    });

    describe('WHEN: using the column menu', () => {
      it.each([
        ['da', 'Kolonnehandlinger for Service', 'Flyt til venstre', 'Flyt til højre'],
        ['sv', 'Kolumnåtgärder för Service', 'Flytta till vänster', 'Flytta till höger'],
        ['nb', 'Kolonnehandlinger for Service', 'Flytt til venstre', 'Flytt til høyre'],
        ['fi', 'Sarakkeen Service toiminnot', 'Siirrä vasemmalle', 'Siirrä oikealle']
      ])('THEN: it names the menu and keeps its items consistent with their visible text in %s', (localeId, menu, left, right) => {
        const labels = SHIPPED_CONTROLS_LOCALES[localeId].headerActions?.accessibilityLabels;

        expect(labels?.menuButton?.({ label: 'Service' })).toBe(menu);
        expect(labels?.menuLabel?.({ label: 'Service' })).toBe(menu);

        for (const direction of ['left', 'right'] as const) {
          const context = { label: 'Service', direction };

          expect(labels?.moveButton?.(context)).toBe(direction === 'left' ? left : right);
          expect(labels?.moveButton?.(context)).toBe(labels?.moveButtonText?.(context));

          for (const toggleAction of ['pin', 'unpin'] as const) {
            const pinContext = { ...unpinnedHeaderContext, pinSide: direction, toggleAction };

            expect(labels?.pinButton?.(pinContext)).toBe(labels?.pinButtonText?.(pinContext));
          }
        }
      });
    });

    describe('WHEN: announcing Finnish pin directions', () => {
      it('THEN: it uses destination cases for pinning and source cases for unpinning', () => {
        const labels = SHIPPED_CONTROLS_LOCALES['fi'].headerActions?.accessibilityLabels;

        expect(labels?.pinButton?.({ ...unpinnedHeaderContext, pinSide: 'right' })).toBe('Kiinnitä oikealle');
        expect(labels?.pinButton?.({ ...pinnedHeaderContext, pinSide: 'left' })).toBe('Irrota vasemmalta');
      });
    });

    describe('WHEN: scrolling horizontally', () => {
      it.each([
        ['da', 'Vandret rulning', 'Rul til venstre', 'Rul til højre', 'Rulleposition'],
        ['sv', 'Vågrät rullning', 'Rulla åt vänster', 'Rulla åt höger', 'Rullningsläge'],
        ['nb', 'Vannrett rulling', 'Rull til venstre', 'Rull til høyre', 'Rulleposisjon'],
        ['fi', 'Vaakavieritys', 'Vieritä vasemmalle', 'Vieritä oikealle', 'Vierityksen sijainti']
      ])('THEN: it preserves direction without repeating the table context in %s', (localeId, group, left, right, position) => {
        const control = SHIPPED_CONTROLS_LOCALES[localeId].scrollControl;

        expect(control?.groupAriaLabel).toBe(group);
        expect(control?.accessibilityLabels?.scrollLeftAriaLabel).toBe(left);
        expect(control?.accessibilityLabels?.scrollRightAriaLabel).toBe(right);
        expect(control?.accessibilityLabels?.scrollPositionAriaLabel).toBe(position);
      });
    });
  });
});
