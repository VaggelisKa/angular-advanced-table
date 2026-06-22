import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { map } from 'rxjs';

import { findShowcaseDoc } from '../../showcase-navigation';
import { DocsMarkdownCache } from './docs-markdown-cache';

interface DocsRouteData {
  readonly docId?: unknown;
}

const readDocsRouteData = (data: Data): DocsRouteData => ({ docId: data['docId'] });

@Component({
  selector: 'app-docs-page',
  imports: [MarkdownComponent],
  templateUrl: './docs-page.html',
  styleUrl: './docs-page.css',
})
export class DocsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly docsMarkdownCache = inject(DocsMarkdownCache);
  private readonly routeData = toSignal(this.route.data.pipe(map(readDocsRouteData)), {
    initialValue: readDocsRouteData(this.route.snapshot.data),
  });

  protected readonly doc = computed(() => {
    const docId = this.routeData().docId;

    return findShowcaseDoc(typeof docId === 'string' ? docId : undefined);
  });
  protected readonly markdownState = computed(() =>
    this.docsMarkdownCache.getState(this.doc().markdownPath),
  );
  protected readonly loadFailed = computed(() => this.markdownState().status === 'error');

  constructor() {
    effect(() => {
      const markdownPath = this.doc().markdownPath;

      untracked(() => this.docsMarkdownCache.load(markdownPath));
    });
  }
}
