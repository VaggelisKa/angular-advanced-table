import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DOCS_SEARCH_INDEX_LOADER, DocsSearchStore } from './docs-search.store';

type StubIndexModule = { docsSearchIndex: Record<string, { sections: [] }> };

const createFailOnceLoader = (): { load: () => Promise<StubIndexModule>; attempts: () => number } => {
  let attempts = 0;

  return {
    attempts: (): number => attempts,
    load: async (): Promise<StubIndexModule> => {
      /* A microtask hop keeps the stub as async as the real chunk import. */
      await Promise.resolve();

      attempts += 1;

      if (attempts === 1) {
        throw new Error('docs search index chunk failed to load');
      }

      return { docsSearchIndex: { '/docs/sorting.md': { sections: [] } } };
    }
  };
};

describe('FEATURE: Docs search store chunk failure', () => {
  describe('GIVEN: the lazy search index chunk fails to download on the first attempt', () => {
    describe('WHEN: the corpus is preloaded, awaited, and loaded again', () => {
      it('THEN: it swallows the preload failure, rejects the in-flight load, and retries the import on the next load', async () => {
        const loader = createFailOnceLoader();

        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection(), { provide: DOCS_SEARCH_INDEX_LOADER, useValue: loader.load }]
        });

        const store = TestBed.inject(DocsSearchStore);

        expect(store.corpusError()).toBe(false);
        expect(() => store.preloadCorpus()).not.toThrow();
        await expect(store.loadCorpus()).rejects.toThrow('docs search index chunk failed to load');
        expect(store.corpus()).toBeNull();
        expect(store.corpusError()).toBe(true);

        const corpus = await store.loadCorpus();

        expect(loader.attempts()).toBe(2);
        expect(corpus.length).toBeGreaterThan(0);
        expect(store.corpus()).toBe(corpus);
        expect(store.corpusError()).toBe(false);
      });
    });
  });
});
