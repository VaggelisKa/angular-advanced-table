import type { NatTableAccessibilityText } from './accessibility.type';
import {
  FILTERING_CONTEXTS,
  PAGINATION_CONTEXTS,
  REORDER_CONTEXTS,
  VISIBILITY_CONTEXTS
} from '../test-helpers/accessibility-contexts.helper';
import { expectDefined } from '../test-helpers/locale-copy.helper';
import { SHIPPED_TABLE_LOCALES } from '../test-helpers/shipped-locales.helper';
import { SUMMARY_CONTEXTS } from '../test-helpers/summary-contexts.helper';

const accessibilityTextOf = (localeId: string): NatTableAccessibilityText =>
  expectDefined(SHIPPED_TABLE_LOCALES[localeId].accessibilityText, localeId);

describe('FEATURE: concise Nordic summaries and announcements', () => {
  describe('GIVEN: the Nordic accessibility dictionaries', () => {
    describe('WHEN: announcing an empty, partial or complete view', () => {
      it.each([
        [
          'da',
          [
            'Ingen rækker vises. 1 synlig kolonne. Side 1 af 2.',
            'Viser 10 af 20 rækker, 4 synlige kolonner. Side 1 af 2.',
            'Viser 1 række, 1 synlig kolonne.'
          ],
          [
            'Ingen elementer vises. 1 synligt felt. Side 1 af 2.',
            'Viser 10 af 20 elementer, 4 synlige felter. Side 1 af 2.',
            'Viser 1 element, 1 synligt felt.'
          ]
        ],
        [
          'sv',
          [
            'Inga rader visas. 1 synlig kolumn. Sida 1 av 2.',
            'Visar 10 av 20 rader, 4 synliga kolumner. Sida 1 av 2.',
            'Visar 1 rad, 1 synlig kolumn.'
          ],
          [
            'Inga objekt visas. 1 synligt fält. Sida 1 av 2.',
            'Visar 10 av 20 objekt, 4 synliga fält. Sida 1 av 2.',
            'Visar 1 objekt, 1 synligt fält.'
          ]
        ],
        [
          'nb',
          [
            'Ingen rader vises. 1 synlig kolonne. Side 1 av 2.',
            'Viser 10 av 20 rader, 4 synlige kolonner. Side 1 av 2.',
            'Viser 1 rad, 1 synlig kolonne.'
          ],
          [
            'Ingen elementer vises. 1 synlig felt. Side 1 av 2.',
            'Viser 10 av 20 elementer, 4 synlige felter. Side 1 av 2.',
            'Viser 1 element, 1 synlig felt.'
          ]
        ],
        [
          'fi',
          [
            'Ei rivejä näkyvissä. Näkyvissä 1 sarake. Sivu 1 / 2.',
            'Näytetään 10 / 20 riviä. Näkyvissä 4 saraketta. Sivu 1 / 2.',
            'Näytetään 1 rivi. Näkyvissä 1 sarake.'
          ],
          [
            'Ei kohteita näkyvissä. Näkyvissä 1 kenttä. Sivu 1 / 2.',
            'Näytetään 10 / 20 kohdetta. Näkyvissä 4 kenttää. Sivu 1 / 2.',
            'Näytetään 1 kohde. Näkyvissä 1 kenttä.'
          ]
        ]
      ] as const)('THEN: it retains visible counts and inflects rows, columns, items and fields in %s', (localeId, tables, lists) => {
        const text = accessibilityTextOf(localeId);

        SUMMARY_CONTEXTS.forEach((context, index) => {
          expect(text.tableSummary?.(context)).toBe(tables[index]);
          expect(text.listSummary?.(context)).toBe(lists[index]);
        });
      });
    });

    describe('WHEN: announcing search results and filtered or unfiltered counts', () => {
      it.each([
        [
          'da',
          [
            'Ingen rækker matcher "alpha".',
            'Ingen rækker matcher de aktuelle filtre.',
            '1 række matcher "alpha".',
            '3 rækker matcher "alpha".',
            '1 filtreret række.',
            '3 filtrerede rækker.',
            'Alle rækker: 1.',
            'Alle rækker: 20.'
          ]
        ],
        [
          'sv',
          [
            'Inga rader matchar "alpha".',
            'Inga rader matchar de aktuella filtren.',
            '1 rad matchar "alpha".',
            '3 rader matchar "alpha".',
            '1 filtrerad rad.',
            '3 filtrerade rader.',
            'Alla rader: 1.',
            'Alla rader: 20.'
          ]
        ],
        [
          'nb',
          [
            'Ingen rader samsvarer med "alpha".',
            'Ingen rader samsvarer med gjeldende filtre.',
            '1 rad samsvarer med "alpha".',
            '3 rader samsvarer med "alpha".',
            '1 filtrert rad.',
            '3 filtrerte rader.',
            'Alle rader: 1.',
            'Alle rader: 20.'
          ]
        ],
        [
          'fi',
          [
            'Mikään rivi ei vastaa hakua "alpha".',
            'Mikään rivi ei vastaa nykyisiä suodattimia.',
            '1 hakua "alpha" vastaava rivi.',
            '3 hakua "alpha" vastaavaa riviä.',
            '1 suodatettu rivi.',
            '3 suodatettua riviä.',
            'Kaikki rivit: 1.',
            'Kaikki rivit: 20.'
          ]
        ]
      ] as const)('THEN: it preserves grammatical standalone announcements in %s', (localeId, expected) => {
        const text = accessibilityTextOf(localeId);

        FILTERING_CONTEXTS.forEach((context, index) => expect(text.filteringChange?.(context)).toBe(expected[index]));
      });
    });

    describe('WHEN: changing the number of rows or items per page', () => {
      it.each([
        [
          'da',
          ['25 rækker pr. side. Side 2 af 5.', '1 række pr. side. Side 1 af 1.'],
          ['25 elementer pr. side. Side 2 af 5.', '1 element pr. side. Side 1 af 1.']
        ],
        [
          'sv',
          ['25 rader per sida. Sida 2 av 5.', '1 rad per sida. Sida 1 av 1.'],
          ['25 objekt per sida. Sida 2 av 5.', '1 objekt per sida. Sida 1 av 1.']
        ],
        [
          'nb',
          ['25 rader per side. Side 2 av 5.', '1 rad per side. Side 1 av 1.'],
          ['25 elementer per side. Side 2 av 5.', '1 element per side. Side 1 av 1.']
        ],
        [
          'fi',
          ['25 riviä sivua kohden. Sivu 2 / 5.', '1 rivi sivua kohden. Sivu 1 / 1.'],
          ['25 kohdetta sivua kohden. Sivu 2 / 5.', '1 kohde sivua kohden. Sivu 1 / 1.']
        ]
      ] as const)('THEN: it keeps the page context and correct count forms in %s', (localeId, tables, lists) => {
        const text = accessibilityTextOf(localeId);

        PAGINATION_CONTEXTS.forEach((context, index) => {
          expect(text.pageSizeChange?.(context)).toBe(tables[index]);
          expect(text.listPageSizeChange?.(context)).toBe(lists[index]);
        });
      });
    });

    describe('WHEN: moving a column within each pinning zone', () => {
      it.each([
        [
          'da',
          [
            'Kolonnen Service flyttet til position 1 af 2, fastgjort til venstre.',
            'Kolonnen Service flyttet til position 2 af 5, ikke fastgjort.',
            'Kolonnen Service flyttet til position 3 af 3, fastgjort til højre.'
          ]
        ],
        [
          'sv',
          [
            'Kolumnen Service flyttad till position 1 av 2, fäst till vänster.',
            'Kolumnen Service flyttad till position 2 av 5, inte fäst.',
            'Kolumnen Service flyttad till position 3 av 3, fäst till höger.'
          ]
        ],
        [
          'nb',
          [
            'Kolonnen Service flyttet til posisjon 1 av 2, festet til venstre.',
            'Kolonnen Service flyttet til posisjon 2 av 5, ikke festet.',
            'Kolonnen Service flyttet til posisjon 3 av 3, festet til høyre.'
          ]
        ],
        [
          'fi',
          [
            'Sarake Service siirretty paikkaan 1 / 2, kiinnitetty vasemmalle.',
            'Sarake Service siirretty paikkaan 2 / 5, ei kiinnitetty.',
            'Sarake Service siirretty paikkaan 3 / 3, kiinnitetty oikealle.'
          ]
        ]
      ] as const)('THEN: it retains the column, position and pinning state in %s', (localeId, expected) => {
        const text = accessibilityTextOf(localeId);

        REORDER_CONTEXTS.forEach((context, index) => expect(text.columnReorder?.(context)).toBe(expected[index]));
      });
    });
  });

  describe('GIVEN: Finnish counts supplied separately from formatted number text', () => {
    describe('WHEN: rendering zero, one and counts ending in one', () => {
      it.each([
        [0, '0', 'riviä', 'kohdetta', 'saraketta', 'kenttää'],
        [1, '1', 'rivi', 'kohde', 'sarake', 'kenttä'],
        [2, '2', 'riviä', 'kohdetta', 'saraketta', 'kenttää'],
        [21, '21', 'riviä', 'kohdetta', 'saraketta', 'kenttää'],
        [1001, '1 001', 'riviä', 'kohdetta', 'saraketta', 'kenttää']
      ] as const)('THEN: it uses the correct Finnish noun forms for %s', (count, formatted, rows, items, columns, fields) => {
        const text = accessibilityTextOf('fi');
        const pagination = { ...PAGINATION_CONTEXTS[1], pageSizeValue: count, pageSizeText: formatted };
        const visibility = {
          ...VISIBILITY_CONTEXTS[0],
          changedColumns: [],
          visibleColumnsValue: count,
          visibleColumnsText: formatted
        };

        expect(text.pageSizeChange?.(pagination)).toBe(`${formatted} ${rows} sivua kohden. Sivu 1 / 1.`);
        expect(text.listPageSizeChange?.(pagination)).toBe(`${formatted} ${items} sivua kohden. Sivu 1 / 1.`);
        expect(text.columnVisibilityChange?.(visibility)).toBe(`Näkyvissä ${formatted} ${columns}.`);
        expect(text.listColumnVisibilityChange?.(visibility)).toBe(`Näkyvissä ${formatted} ${fields}.`);
      });
    });

    describe('WHEN: announcing a single loaded record out of a formatted total', () => {
      it('THEN: it inflects the total independently of the visible count in both renderers', () => {
        const text = accessibilityTextOf('fi');
        const context = { ...SUMMARY_CONTEXTS[2], totalRowsValue: 1001, totalRowsText: '1 001' };

        expect(text.tableSummary?.(context)).toBe('Näytetään 1 / 1 001 riviä. Näkyvissä 1 sarake.');
        expect(text.listSummary?.(context)).toBe('Näytetään 1 / 1 001 kohdetta. Näkyvissä 1 kenttä.');
      });
    });
  });
});
