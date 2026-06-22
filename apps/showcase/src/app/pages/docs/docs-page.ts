import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { map } from 'rxjs';

import { findShowcaseDoc } from '../../showcase-navigation';

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
  private readonly routeData = toSignal(this.route.data.pipe(map(readDocsRouteData)), {
    initialValue: readDocsRouteData(this.route.snapshot.data),
  });

  protected readonly loadFailed = signal(false);
  protected readonly doc = computed(() => {
    const docId = this.routeData().docId;

    return findShowcaseDoc(typeof docId === 'string' ? docId : undefined);
  });

  protected clearMarkdownError(): void {
    this.loadFailed.set(false);
  }

  protected markMarkdownError(_error: unknown): void {
    this.loadFailed.set(true);
  }
}
