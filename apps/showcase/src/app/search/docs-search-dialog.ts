import { DialogRef } from '@angular/cdk/dialog';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, DestroyRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { buildDocsSearchResultGroupViews, getDocsSearchAnnouncement, getNextDocsSearchActiveIndex } from './docs-search-view.util';
import { DocsSearchStore } from './docs-search.store';
import type { DocsSearchResult } from './docs-search.type';
import { searchDocsCorpus } from './docs-search.util';

const ANNOUNCE_DEBOUNCE_MS = 150;

/**
 * Docs search palette content, opened through `Dialog` from the app shell. The
 * CDK dialog owns the modal shell: focus trap, `role`/`aria-modal`, backdrop,
 * Escape dismissal, and scroll blocking. Closing resolves a boolean result —
 * `false` when focus must stay where navigation put it, `true` (or `undefined`
 * for CDK-initiated closes) when the shell should restore trigger focus.
 */
@Component({
  selector: 'app-docs-search-dialog',
  templateUrl: './docs-search-dialog.html',
  styleUrl: './docs-search-dialog.css'
})
export class DocsSearchDialog {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly store = inject(DocsSearchStore);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private announceTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly announcement = signal('');

  protected readonly results = computed<readonly DocsSearchResult[]>(() => {
    const corpus = this.store.corpus();
    const query = this.query();

    return corpus ? searchDocsCorpus(corpus, query) : [];
  });

  protected readonly resultGroups = computed(() => buildDocsSearchResultGroupViews(this.results()));

  /** Flattened in DOM (group) order so `aria-activedescendant` navigation follows what the user sees. */
  protected readonly flatResults = computed(() => this.resultGroups().flatMap((group) => group.results));

  protected readonly hasQuery = computed(() => this.query().trim().length > 0);
  protected readonly showListbox = computed(() => this.flatResults().length > 0);
  protected readonly corpusFailed = computed(() => this.store.corpusError());
  protected readonly corpusLoading = computed(() => this.store.corpus() === null && !this.corpusFailed());
  protected readonly showNoResults = computed(
    () => this.hasQuery() && !this.corpusLoading() && !this.corpusFailed() && this.flatResults().length === 0
  );

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    const active = index >= 0 ? this.flatResults().at(index) : undefined;

    return active ? active.optionId : null;
  });

  public constructor() {
    this.store.preloadCorpus();

    /* CDK's first-tabbable autofocus also targets the input; this direct write
       keeps the focus handoff deterministic across environments. */
    afterNextRender({ write: () => this.searchInput()?.nativeElement.focus() });

    /* The visible results update instantly per keystroke; only the live-region
       announcement is debounced so assistive technology is not spammed. */
    effect(() =>
      this.scheduleAnnouncement(
        getDocsSearchAnnouncement({
          active: this.hasQuery() && !this.corpusLoading(),
          failed: this.corpusFailed(),
          count: this.flatResults().length
        })
      )
    );

    this.destroyRef.onDestroy(() => this.clearAnnounceTimer());
  }

  protected onQueryInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
      this.activeIndex.set(-1);
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const results = this.flatResults();

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(getNextDocsSearchActiveIndex(this.activeIndex(), event.key, results.length));
      this.scrollActiveOptionIntoView();

      return;
    }

    if (event.key === 'Enter') {
      const index = this.activeIndex();
      const active = (index >= 0 ? results.at(index) : undefined) ?? results.at(0);

      if (active) {
        event.preventDefault();
        this.activateResult(active);
      }
    }
  }

  protected setActiveIndex(index: number): void {
    this.activeIndex.set(index);
  }

  protected close(restoreFocus: boolean): void {
    this.dialogRef.close(restoreFocus);
  }

  protected retryCorpusLoad(): void {
    /* Failures land in the store's `corpusError` signal, which this dialog renders. */
    void this.store.loadCorpus().catch(() => undefined);
  }

  protected activateResult(result: DocsSearchResult): void {
    void this.router.navigate([result.routePath], { fragment: result.fragment ?? undefined }).then((navigated) => {
      /* The router skips a same-URL navigation, so the anchor scroll it would
         normally run on NavigationEnd must happen here. Cross-page fragment
         navigation needs no extra handling: the docs page re-scrolls to the
         current fragment once its markdown renders. */
      if (!navigated && result.fragment) {
        this.viewportScroller.scrollToAnchor(result.fragment);
      }
    });
    this.close(false);
  }

  private scheduleAnnouncement(message: string | null): void {
    this.clearAnnounceTimer();

    if (message === null) {
      this.announcement.set('');

      return;
    }

    this.announceTimer = setTimeout(() => this.announcement.set(message), ANNOUNCE_DEBOUNCE_MS);
  }

  private scrollActiveOptionIntoView(): void {
    afterNextRender(
      {
        write: () => {
          const activeOptionId = this.activeOptionId();

          if (activeOptionId !== null) {
            this.document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' });
          }
        }
      },
      { injector: this.injector }
    );
  }

  private clearAnnounceTimer(): void {
    if (this.announceTimer !== null) {
      clearTimeout(this.announceTimer);
      this.announceTimer = null;
    }
  }
}
