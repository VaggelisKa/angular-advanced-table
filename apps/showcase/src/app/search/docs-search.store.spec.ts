import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DocsSearchStore } from './docs-search.store';

describe('FEATURE: Docs search store', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  describe('GIVEN: the store has not loaded the search index yet', () => {
    describe('WHEN: reading the corpus signal', () => {
      it('THEN: it is null before the lazy index chunk loads', () => {
        const store = TestBed.inject(DocsSearchStore);

        expect(store.corpus()).toBeNull();
      });
    });
  });

  describe('GIVEN: the search index chunk has been loaded', () => {
    describe('WHEN: loading the corpus twice', () => {
      it('THEN: it builds the corpus once and caches it', async () => {
        const store = TestBed.inject(DocsSearchStore);
        const first = await store.loadCorpus();
        const second = await store.loadCorpus();

        expect(second).toBe(first);
        expect(store.corpus()).toBe(first);
      });
    });

    describe('WHEN: inspecting the built corpus entries', () => {
      it('THEN: it maps docs, sections, and examples to routes, fragments, and nav group labels', async () => {
        const store = TestBed.inject(DocsSearchStore);
        const corpus = await store.loadCorpus();

        const sortingDoc = corpus.find((entry) => entry.id === 'doc:sorting');

        expect(sortingDoc).toMatchObject({
          kind: 'doc',
          topicLabel: 'Sorting',
          groupLabel: 'Capabilities',
          routePath: '/docs/sorting',
          fragment: null
        });

        const sectionEntry = corpus.find((entry) => entry.kind === 'doc-section' && entry.routePath === '/docs/column-layout');

        expect(sectionEntry?.heading).toBeTruthy();
        expect(sectionEntry?.fragment).toBeTruthy();

        const exampleEntry = corpus.find((entry) => entry.kind === 'example');

        expect(exampleEntry?.routePath.startsWith('/examples/')).toBe(true);
      });
    });
  });
});
