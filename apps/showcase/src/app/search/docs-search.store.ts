import { Injectable, PendingTasks, inject, signal } from '@angular/core';

import { buildDocsSearchCorpus, buildNavGroupLabelMap } from './docs-search-corpus.util';
import type { DocsSearchCorpusEntry } from './docs-search.type';
import { showcaseDocs, showcaseExamples, showcaseNavSections } from '../shell/showcase-navigation';

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
  private corpusPromise: Promise<readonly DocsSearchCorpusEntry[]> | null = null;
  private readonly corpusState = signal<readonly DocsSearchCorpusEntry[] | null>(null);

  /** Null until the index chunk has loaded; the built corpus afterwards. */
  public readonly corpus = this.corpusState.asReadonly();

  /** Fire-and-forget warm-up for trigger hover/focus, mirroring the nav tree's docs-page prefetch. */
  public preloadCorpus(): void {
    void this.loadCorpus();
  }

  public async loadCorpus(): Promise<readonly DocsSearchCorpusEntry[]> {
    if (this.corpusPromise) {
      return this.corpusPromise;
    }

    // Tracked as a pending task so `ApplicationRef.whenStable()` covers the
    // in-flight chunk download (see NavTree.prefetchNavItem for the rationale).
    const removePendingTask = this.pendingTasks.add();

    this.corpusPromise = import('../docs/docs-search-index')
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
      .finally(removePendingTask);

    return this.corpusPromise;
  }
}
