/* eslint-disable max-lines -- docs page owns route selection, generated HTML decoration, and code-copy behavior */
import { DOCUMENT } from '@angular/common';
import { Component, Injector, SecurityContext, afterNextRender, computed, effect, inject, untracked, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Data } from '@angular/router';

import { map } from 'rxjs';

import { createDocsCodeCopyIcons } from './docs-code-copy-icons';
import { findDocsHtmlEntry } from './docs-html-registry';
import type { DocsHtmlHeading } from './docs-html-registry';
import { copyText, highlightMarkdownCode, shouldLetBrowserHandleLink } from './docs-page-utils';
import { DocsTopicExample } from './docs-topic-example';
import type { DocsMarkdownBlock, DocsTopicBlock, DocsTopicExampleBlock } from './docs-topic.types';
import { findDocsTopicContent } from './docs-topics';
import { findShowcaseDoc } from '../../showcase-navigation';

type DocsRouteData = {
  readonly docId?: unknown;
};

type RenderedDocsMarkdownBlock = DocsMarkdownBlock & {
  readonly trustedHtml: SafeHtml;
};

type RenderedDocsTopicBlock = RenderedDocsMarkdownBlock | DocsTopicExampleBlock;

const readDocsRouteData = (data: Data): DocsRouteData => ({ docId: data['docId'] });
const CODE_COPY_BUTTON_SELECTOR = '[data-docs-code-copy]';
const CODE_COPY_BUTTON_CLASS = 'docs-code-copy';
const CODE_COPY_BLOCK_CLASS = 'docs-code-block';
const CODE_SCROLL_CLASS = 'docs-code-scroll';
const CODE_COPY_COPIED_CLASS = 'is-copied';
const CODE_COPY_LABEL = 'Copy code block';
const CODE_COPIED_LABEL = 'Copied code block';
const CODE_COPY_RESET_DELAY_MS = 2000;

const restoreSanitizedHeadingIds = (html: string, headings: readonly DocsHtmlHeading[]): string => {
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

@Component({
  selector: 'app-docs-page',
  imports: [DocsTopicExample, RouterLink],
  templateUrl: './docs-page.html',
  styleUrl: './docs-page.css'
})
export class DocsPage {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownContainer = viewChild<ElementRef<HTMLElement>>('markdownContainer');
  private readonly copiedResetTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
  private readonly routeData = toSignal(this.route.data.pipe(map(readDocsRouteData)), {
    initialValue: readDocsRouteData(this.route.snapshot.data)
  });

  protected readonly doc = computed(() => {
    const docId = this.routeData().docId;

    return findShowcaseDoc(typeof docId === 'string' ? docId : undefined);
  });

  protected readonly topic = computed(() => findDocsTopicContent(this.doc().id));

  protected readonly renderedBlocks = computed<readonly RenderedDocsTopicBlock[]>(() =>
    this.topic().blocks.map((block) => this.renderTopicBlock(block))
  );

  public constructor() {
    effect(() => {
      const hasRenderedMarkdown = this.renderedBlocks().some((block) => block.kind === 'markdown');

      if (hasRenderedMarkdown) {
        untracked(() => this.decorateCodeBlocks());
      }
    });
  }

  protected tableOfContentsHref(path: string): string {
    return path.startsWith('#') ? `${this.doc().path}${path}` : path;
  }

  protected navigateToTableOfContentsItem(event: MouseEvent, path: string): void {
    if (!path.startsWith('#') || shouldLetBrowserHandleLink(event)) {
      return;
    }

    event.preventDefault();

    const fragment = path.slice(1);

    void this.router.navigate([], { fragment, relativeTo: this.route });
  }

  protected decorateCodeBlocks(): void {
    afterNextRender({ write: () => this.decorateRenderedMarkdown() }, { injector: this.injector });
  }

  private renderTopicBlock(block: DocsTopicBlock): RenderedDocsTopicBlock {
    if (block.kind === 'example') {
      return block;
    }

    const entry = findDocsHtmlEntry(block.markdownPath);

    if (!entry) {
      throw new Error(`Missing generated docs HTML for ${block.markdownPath}`);
    }

    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, entry.html) ?? '';
    const html = restoreSanitizedHeadingIds(sanitizedHtml, entry.headings);

    return {
      ...block,
      trustedHtml: this.sanitizer.bypassSecurityTrustHtml(html)
    };
  }

  private decorateRenderedMarkdown(): void {
    const container = this.markdownContainer()?.nativeElement;

    if (!container) {
      return;
    }

    this.scrollToCurrentFragment();

    for (const codeBlock of Array.from(container.querySelectorAll('.docs-markdown pre'))) {
      const code = codeBlock.querySelector('code');

      if (!code || codeBlock.querySelector(CODE_COPY_BUTTON_SELECTOR)) {
        continue;
      }

      const scrollArea = this.document.createElement('div');
      const button = this.document.createElement('button');

      scrollArea.className = CODE_SCROLL_CLASS;
      code.replaceWith(scrollArea);
      scrollArea.append(code);
      button.type = 'button';
      button.className = CODE_COPY_BUTTON_CLASS;
      button.setAttribute('aria-label', CODE_COPY_LABEL);
      button.setAttribute('data-docs-code-copy', '');
      button.title = CODE_COPY_LABEL;
      button.append(...createDocsCodeCopyIcons(this.document));
      button.addEventListener('click', () => this.copyDocsCodeBlock(button, code));
      codeBlock.classList.add(CODE_COPY_BLOCK_CLASS);
      codeBlock.append(button);
    }

    highlightMarkdownCode(container);
  }

  private copyDocsCodeBlock(button: HTMLButtonElement, code: HTMLElement): void {
    void copyText(this.document, code.textContent.replace(/\n$/, '')).then((copied) => this.setCopyButtonState(button, copied));
  }

  private scrollToCurrentFragment(): void {
    const fragment = this.route.snapshot.fragment;

    if (fragment) {
      queueMicrotask(() => this.scrollToFragment(fragment));
    }
  }

  private scrollToFragment(fragment: string): void {
    this.document.getElementById(fragment)?.scrollIntoView({ block: 'start' });
  }

  private setCopyButtonState(button: HTMLButtonElement, copied: boolean): void {
    button.classList.toggle(CODE_COPY_COPIED_CLASS, copied);
    button.setAttribute('aria-label', copied ? CODE_COPIED_LABEL : CODE_COPY_LABEL);
    button.title = copied ? CODE_COPIED_LABEL : CODE_COPY_LABEL;

    if (!copied) {
      return;
    }

    const existingTimer = this.copiedResetTimers.get(button);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    this.copiedResetTimers.set(
      button,
      setTimeout(() => {
        if (button.isConnected) {
          this.setCopyButtonState(button, false);
        }
      }, CODE_COPY_RESET_DELAY_MS)
    );
  }
}
