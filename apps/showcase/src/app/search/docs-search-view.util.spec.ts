import { buildDocsSearchResultGroupViews, buildSnippetSegments, getNextDocsSearchActiveIndex } from './docs-search-view.util';
import type { DocsSearchResult } from './docs-search.type';

const createResult = (id: string, kind: DocsSearchResult['kind'], topicLabel: string): DocsSearchResult => ({
  id,
  kind,
  topicLabel,
  groupLabel: 'Capabilities',
  heading: null,
  snippet: null,
  routePath: '/docs/sorting',
  fragment: null
});

describe('FEATURE: Docs search view model', () => {
  describe('GIVEN: flat results spanning multiple display groups', () => {
    describe('WHEN: building the grouped listbox views', () => {
      it('THEN: it assigns sequential option ids in flattened group order for aria-activedescendant', () => {
        const groups = buildDocsSearchResultGroupViews([
          createResult('doc:sorting', 'doc', 'Sorting'),
          createResult('doc-section:sorting:basics', 'doc-section', 'Sorting'),
          createResult('example:zebra', 'example', 'Zebra'),
          createResult('doc:columns', 'doc', 'Columns')
        ]);
        const flat = groups.flatMap((group) => group.results);

        expect(flat.map((result) => result.optionId)).toStrictEqual([
          'docs-search-option-0',
          'docs-search-option-1',
          'docs-search-option-2',
          'docs-search-option-3'
        ]);
        expect(flat.map((result) => result.index)).toStrictEqual([0, 1, 2, 3]);
      });
    });
  });

  describe('GIVEN: a snippet with match ranges', () => {
    describe('WHEN: splitting it into segments', () => {
      it('THEN: it marks ranges at the text boundaries without empty or duplicated segments', () => {
        const segments = buildSnippetSegments({
          text: 'sort rows fast',
          ranges: [
            { start: 0, length: 4 },
            { start: 10, length: 4 }
          ]
        });

        expect(segments).toStrictEqual([
          { text: 'sort', marked: true },
          { text: ' rows ', marked: false },
          { text: 'fast', marked: true }
        ]);
      });

      it('THEN: it returns no segments for a missing snippet', () => {
        expect(buildSnippetSegments(null)).toStrictEqual([]);
      });
    });
  });

  describe('GIVEN: an active option index and an option count', () => {
    describe('WHEN: pressing ArrowDown', () => {
      it('THEN: it starts at the first option and wraps past the last one', () => {
        expect(getNextDocsSearchActiveIndex(-1, 'ArrowDown', 3)).toBe(0);
        expect(getNextDocsSearchActiveIndex(1, 'ArrowDown', 3)).toBe(2);
        expect(getNextDocsSearchActiveIndex(2, 'ArrowDown', 3)).toBe(0);
      });
    });

    describe('WHEN: pressing ArrowUp', () => {
      it('THEN: it starts at the last option and wraps past the first one', () => {
        expect(getNextDocsSearchActiveIndex(-1, 'ArrowUp', 3)).toBe(2);
        expect(getNextDocsSearchActiveIndex(2, 'ArrowUp', 3)).toBe(1);
        expect(getNextDocsSearchActiveIndex(0, 'ArrowUp', 3)).toBe(2);
      });
    });

    describe('WHEN: no options are listed', () => {
      it('THEN: it keeps the active index cleared for both arrow keys', () => {
        expect(getNextDocsSearchActiveIndex(-1, 'ArrowDown', 0)).toBe(-1);
        expect(getNextDocsSearchActiveIndex(-1, 'ArrowUp', 0)).toBe(-1);
      });
    });
  });
});
