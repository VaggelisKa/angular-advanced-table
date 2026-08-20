import { DOCS_SEARCH_EXAMPLES_GROUP_LABEL, buildDocsSearchCorpus, buildNavGroupLabelMap } from './docs-search-corpus.util';
import type { DocsSearchCorpusSources } from './docs-search-corpus.util';
import type { DocsSearchCorpusEntry } from './docs-search.type';
import { groupDocsSearchResults, searchDocsCorpus, tokenizeDocsSearchQuery } from './docs-search.util';
import type { ShowcaseNavSection } from '../shell/showcase-navigation';

const createSources = (overrides: Partial<DocsSearchCorpusSources> = {}): DocsSearchCorpusSources => ({
  index: {
    '/docs/sorting.md': { sections: [] },
    '/docs/columns.md': {
      sections: [{ headingId: 'sorting-columns', heading: 'Sorting columns', depth: 2, text: 'Column ordering explained.' }]
    },
    '/docs/state.md': { sections: [] },
    '/docs/export.md': {
      sections: [{ headingId: 'formats', heading: 'Formats', depth: 2, text: 'You can apply sorting before an export runs.' }]
    }
  },
  docs: [
    { id: 'sorting', label: 'Sorting', description: 'Order rows', path: '/docs/sorting' },
    { id: 'columns', label: 'Columns', description: 'Column metadata', path: '/docs/columns' },
    { id: 'state', label: 'State', description: 'Sorting slices live here', path: '/docs/state' },
    { id: 'export', label: 'Export', description: 'CSV defaults', path: '/docs/export' }
  ],
  examples: [{ id: 'zebra', label: 'Zebra', description: 'Zebra sorting demo', path: '/examples/zebra' }],
  groupLabels: {
    '/docs/sorting': 'Capabilities',
    '/docs/columns': 'Core principles',
    '/docs/state': 'Core principles',
    '/docs/export': 'Advanced',
    '/examples/zebra': 'Gallery'
  },
  ...overrides
});

const createCorpus = (overrides: Partial<DocsSearchCorpusSources> = {}): readonly DocsSearchCorpusEntry[] =>
  buildDocsSearchCorpus(createSources(overrides));

describe('FEATURE: Docs search query and scoring', () => {
  describe('GIVEN: a corpus built from docs, sections, and examples', () => {
    describe('WHEN: searching a token that matches different fields across entries', () => {
      it('THEN: it ranks title matches above heading, description, and body matches', () => {
        const results = searchDocsCorpus(createCorpus(), 'sorting');

        expect(results.map((result) => result.id)).toStrictEqual([
          'doc:sorting',
          'doc-section:columns:sorting-columns',
          'doc:state',
          'example:zebra',
          'doc-section:export:formats'
        ]);
      });
    });

    describe('WHEN: searching with multiple tokens', () => {
      it('THEN: it only returns entries where every token matches', () => {
        const results = searchDocsCorpus(createCorpus(), 'sorting zebra');

        expect(results.map((result) => result.id)).toStrictEqual(['example:zebra']);
      });

      it('THEN: it returns nothing when one token matches nowhere', () => {
        expect(searchDocsCorpus(createCorpus(), 'sorting unmatchabletoken')).toStrictEqual([]);
      });
    });

    describe('WHEN: searching a blank query', () => {
      it('THEN: it returns no results', () => {
        expect(searchDocsCorpus(createCorpus(), '   ')).toStrictEqual([]);
      });
    });

    describe('WHEN: more entries match than the result cap', () => {
      it('THEN: it caps the results at ten', () => {
        const sections = Array.from({ length: 15 }, (_, index) => ({
          headingId: `section-${index}`,
          heading: `Section ${index}`,
          depth: 2,
          text: 'pagination content'
        }));
        const corpus = createCorpus({ index: { '/docs/sorting.md': { sections } } });

        expect(searchDocsCorpus(corpus, 'pagination')).toHaveLength(10);
      });
    });

    describe('WHEN: reading the snippet of a body match', () => {
      it('THEN: it returns match offsets that point at the matched substring', () => {
        const results = searchDocsCorpus(createCorpus(), 'export runs');
        const section = results.find((result) => result.id === 'doc-section:export:formats');
        const snippet = section?.snippet;

        expect(snippet).toBeDefined();
        expect(snippet?.ranges.length).toBeGreaterThan(0);

        for (const range of snippet?.ranges ?? []) {
          const matched = snippet?.text.slice(range.start, range.start + range.length).toLowerCase();

          expect(['export', 'runs']).toContain(matched);
        }
      });

      it('THEN: it windows long bodies around the first match with ellipses', () => {
        const longBody = `${'lorem ipsum '.repeat(30)}needle in the middle ${'dolor sit '.repeat(30)}`;
        const corpus = createCorpus({
          index: { '/docs/sorting.md': { sections: [{ headingId: 'long', heading: 'Long', depth: 2, text: longBody }] } }
        });
        const [result] = searchDocsCorpus(corpus, 'needle');

        expect(result.snippet?.text).toContain('needle');
        expect(result.snippet?.text.length).toBeLessThan(longBody.length);
        expect(result.snippet?.text.startsWith('…')).toBe(true);
      });
    });
  });

  describe('GIVEN: a raw query string', () => {
    describe('WHEN: tokenizing it', () => {
      it('THEN: it lowercases, splits on whitespace, and dedupes tokens', () => {
        expect(tokenizeDocsSearchQuery('  Pinning   pinning\tZones ')).toStrictEqual(['pinning', 'zones']);
      });
    });
  });

  describe('GIVEN: flat search results', () => {
    describe('WHEN: grouping them for display', () => {
      it('THEN: it groups docs by topic and examples under a shared examples group', () => {
        const groups = groupDocsSearchResults(searchDocsCorpus(createCorpus(), 'sorting'));

        expect(groups.map((group) => group.label)).toStrictEqual([
          'Sorting',
          'Columns',
          'State',
          DOCS_SEARCH_EXAMPLES_GROUP_LABEL,
          'Export'
        ]);
        expect(groups.flatMap((group) => group.results)).toHaveLength(5);
      });
    });
  });

  describe('GIVEN: the showcase nav sections', () => {
    describe('WHEN: building the group label map', () => {
      it('THEN: it maps section items and group items to their closest labels', () => {
        const sections: readonly ShowcaseNavSection[] = [
          {
            id: 'docs',
            label: 'Docs',
            ariaLabel: 'Docs',
            items: [{ id: 'quick-start', label: 'Quick start', description: 'Install', path: '/docs/quick-start' }],
            groups: [
              {
                id: 'core',
                label: 'Core principles',
                ariaLabel: 'Core',
                items: [{ id: 'state', label: 'State', description: 'Slices', path: '/docs/state' }]
              }
            ]
          }
        ];

        expect(buildNavGroupLabelMap(sections)).toStrictEqual({
          '/docs/quick-start': 'Docs',
          '/docs/state': 'Core principles'
        });
      });
    });
  });
});
