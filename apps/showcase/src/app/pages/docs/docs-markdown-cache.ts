import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, SecurityContext, TransferState, inject, makeStateKey, signal } from '@angular/core';
import type { StateKey } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';

import { firstValueFrom } from 'rxjs';

import { renderMarkdownToHtml } from './docs-markdown-renderer';
import type { RenderedMarkdownHeading } from './docs-markdown-renderer';

export type DocsMarkdownStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type DocsMarkdownState = {
  readonly status: DocsMarkdownStatus;
  readonly html: string;
  readonly trustedHtml: SafeHtml | string;
  readonly error?: unknown;
};

const EMPTY_DOCS_MARKDOWN_STATE: DocsMarkdownState = {
  status: 'idle',
  html: '',
  trustedHtml: ''
};

export const getDocsHtmlTransferStateKey = (markdownPath: string): StateKey<string> => makeStateKey(`docs-html:${markdownPath}`);

const restoreSanitizedHeadingIds = (html: string, headings: readonly RenderedMarkdownHeading[]): string => {
  let headingIndex = 0;

  return html.replace(/<h([1-6])>/g, (match: string, depth: string) => {
    if (headingIndex >= headings.length || headings[headingIndex].depth !== Number(depth)) {
      return match;
    }

    const heading = headings[headingIndex];

    headingIndex += 1;

    return `<h${depth} id="${heading.id}">`;
  });
};

@Injectable({ providedIn: 'root' })
export class DocsMarkdownCache {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly transferState = inject(TransferState);
  private readonly states = signal<ReadonlyMap<string, DocsMarkdownState>>(new Map());
  private readonly isServer = isPlatformServer(this.platformId);

  public getState(markdownPath: string): DocsMarkdownState {
    return this.states().get(markdownPath) ?? EMPTY_DOCS_MARKDOWN_STATE;
  }

  public load(markdownPath: string): void {
    const currentState = this.getState(markdownPath);

    if (currentState.status === 'loading' || currentState.status === 'loaded') {
      return;
    }

    this.setState(markdownPath, {
      status: 'loading',
      html: currentState.html,
      trustedHtml: currentState.trustedHtml
    });

    const transferStateKey = getDocsHtmlTransferStateKey(markdownPath);
    const transferredHtml = this.transferState.get<string | null>(transferStateKey, null);

    if (transferredHtml !== null) {
      this.transferState.remove(transferStateKey);
      this.setLoadedState(markdownPath, transferredHtml);

      return;
    }

    void this.loadRenderedMarkdown(markdownPath, currentState.html, transferStateKey);
  }

  public preload(markdownPaths: readonly string[]): void {
    for (const markdownPath of markdownPaths) {
      this.load(markdownPath);
    }
  }

  private setState(markdownPath: string, state: DocsMarkdownState): void {
    this.states.update((states) => {
      const nextStates = new Map(states);

      nextStates.set(markdownPath, state);

      return nextStates;
    });
  }

  private setLoadedState(markdownPath: string, html: string): void {
    this.setState(markdownPath, {
      status: 'loaded',
      html,
      trustedHtml: this.sanitizer.bypassSecurityTrustHtml(html)
    });
  }

  private sanitizeRenderedMarkdown(html: string, headings: readonly RenderedMarkdownHeading[]): string {
    return restoreSanitizedHeadingIds(this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '', headings);
  }

  private async loadRenderedMarkdown(markdownPath: string, previousHtml: string, transferStateKey: StateKey<string>): Promise<void> {
    try {
      const markdown = await firstValueFrom(this.http.get(markdownPath, { responseType: 'text' }));
      const renderedMarkdown = renderMarkdownToHtml(markdown);
      const html = this.sanitizeRenderedMarkdown(renderedMarkdown.html, renderedMarkdown.headings);

      if (this.isServer) {
        this.transferState.set(transferStateKey, html);
      }

      this.setLoadedState(markdownPath, html);
    } catch (error: unknown) {
      this.setState(markdownPath, {
        status: 'error',
        html: previousHtml,
        trustedHtml: this.sanitizer.bypassSecurityTrustHtml(previousHtml),
        error
      });
    }
  }
}
