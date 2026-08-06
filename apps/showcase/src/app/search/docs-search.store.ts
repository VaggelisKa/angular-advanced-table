import { Injectable, InjectionToken, PendingTasks, inject, signal } from '@angular/core';

import { buildDocsSearchCorpus, buildNavGroupLabelMap } from './docs-search-corpus.util';
import type { DocsSearchCorpusEntry } from './docs-search.type';
import type { DocsSearchDocument } from '../docs/docs-search-index';
import { showcaseDocs, showcaseExamples, showcaseNavSections } from '../shell/showcase-navigation';

type DocsSearchIndexModule = {
  readonly docsSearchIndex: Readonly<Record<string, DocsSearchDocument>>;
};

/** Seam over the lazy index chunk import so specs can exercise chunk-load failures. */
export const DOCS_SEARCH_INDEX_LOADER = new InjectionToken<() => Promise<DocsSearchIndexModule>>('DOCS_SEARCH_INDEX_LOADER', {
  providedIn: 'root',
  factory: (): (() => Promise<DocsSearchIndexModule>) => async (): Promise<DocsSearchIndexModule> =>
    import('../docs/docs-search-index')
});

/**
 * Owns the lazily loaded docs search corpus. The generated search index lives
 * in its own lazy chunk (like the docs HTML registry), so shell code must
 * never import it statically; this store dynamically imports it once, builds
 * the corpus, and caches it for every later dialog open.
 */
@Injectable({
  providedIn: 'root'
})
export class DocsSearchStore {
  private readonly pendingTasks = inject(PendingTasks);
  private readonly loadIndex = inject(DOCS_SEARCH_INDEX_LOADER);
  private corpusPromise: Promise<readonly DocsSearchCorpusEntry[]> | null = null;
  private readonly corpusState = signal<readonly DocsSearchCorpusEntry[] | null>(null);
  private readonly corpusErrorState = signal(false);

  /** Null until the index chunk has loaded; the built corpus afterwards. */
  public readonly corpus = this.corpusState.asReadonly();

  /** True while the last chunk download failed; cleared when a retry starts. */
  public readonly corpusError = this.corpusErrorState.asReadonly();

  /** Fire-and-forget warm-up for trigger hover/focus, mirroring the nav tree's docs-page prefetch. */
  public preloadCorpus(): void {
    /* Swallow chunk-load failures here: a failed warm-up must not surface as
       an unhandled rejection, and `loadCorpus` retries on the next call. */
    void this.loadCorpus().catch(() => undefined);
  }

  public async loadCorpus(): Promise<readonly DocsSearchCorpusEntry[]> {
    if (this.corpusPromise) {
      return this.corpusPromise;
    }

    // Tracked as a pending task so `ApplicationRef.whenStable()` covers the
    // in-flight chunk download (see NavTree.prefetchNavItem for the rationale).
    const removePendingTask = this.pendingTasks.add();

    this.corpusErrorState.set(false);
    this.corpusPromise = this.loadIndex()
      .then(({ docsSearchIndex }) => {
        const corpus = buildDocsSearchCorpus({
          index: docsSearchIndex,
          docs: showcaseDocs,
          examples: showcaseExamples,
          groupLabels: buildNavGroupLabelMap(showcaseNavSections)
        });

        this.corpusState.set(corpus);

        return corpus;
      })
      .catch((error: unknown) => {
        /* Do not cache a failed chunk download: dropping the promise lets the
           next dialog open retry instead of staying stuck on "Loading". */
        this.corpusPromise = null;
        this.corpusErrorState.set(true);

        throw error;
      })
      .finally(removePendingTask);

    return this.corpusPromise;
  }
}
