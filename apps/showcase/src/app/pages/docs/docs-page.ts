import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, untracked, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import type { Data } from '@angular/router';

import { MarkdownComponent } from 'ngx-markdown';
import { map } from 'rxjs';

import { DocsMarkdownCache } from './docs-markdown-cache';
import { findShowcaseDoc } from '../../showcase-navigation';

type DocsRouteData = {
  readonly docId?: unknown;
};

const readDocsRouteData = (data: Data): DocsRouteData => ({ docId: data['docId'] });
const CODE_COPY_BUTTON_SELECTOR = '[data-docs-code-copy]';
const CODE_COPY_BUTTON_CLASS = 'docs-code-copy';
const CODE_COPY_BLOCK_CLASS = 'docs-code-block';
const CODE_SCROLL_CLASS = 'docs-code-scroll';
const CODE_COPY_COPIED_CLASS = 'is-copied';
const CODE_COPY_TEXT = 'Copy';
const CODE_COPIED_TEXT = 'Copied';
const CODE_COPY_LABEL = 'Copy code block';
const CODE_COPIED_LABEL = 'Copied code block';
const CODE_COPY_RESET_DELAY_MS = 2000;

@Component({
  selector: 'app-docs-page',
  imports: [MarkdownComponent],
  templateUrl: './docs-page.html',
  styleUrl: './docs-page.css'
})
export class DocsPage {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly docsMarkdownCache = inject(DocsMarkdownCache);
  private readonly markdownContainer = viewChild<ElementRef<HTMLElement>>('markdownContainer');
  private readonly copiedResetTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
  private readonly routeData = toSignal(this.route.data.pipe(map(readDocsRouteData)), {
    initialValue: readDocsRouteData(this.route.snapshot.data)
  });

  protected readonly doc = computed(() => {
    const docId = this.routeData().docId;

    return findShowcaseDoc(typeof docId === 'string' ? docId : undefined);
  });

  protected readonly markdownState = computed(() => this.docsMarkdownCache.getState(this.doc().markdownPath));
  protected readonly loadFailed = computed(() => this.markdownState().status === 'error');

  public constructor() {
    effect(() => {
      const markdownPath = this.doc().markdownPath;

      untracked(() => this.docsMarkdownCache.load(markdownPath));
    });
  }

  protected decorateCodeBlocks(): void {
    const container = this.markdownContainer()?.nativeElement;

    if (!container) {
      return;
    }

    for (const codeBlock of Array.from(container.querySelectorAll('pre'))) {
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
      button.textContent = CODE_COPY_TEXT;
      button.setAttribute('aria-label', CODE_COPY_LABEL);
      button.setAttribute('data-docs-code-copy', '');
      button.addEventListener('click', () => this.copyDocsCodeBlock(button, code));
      codeBlock.classList.add(CODE_COPY_BLOCK_CLASS);
      codeBlock.append(button);
    }
  }

  private copyDocsCodeBlock(button: HTMLButtonElement, code: HTMLElement): void {
    void this.copyText(code.textContent).then((copied) => this.setCopyButtonState(button, copied));
  }

  private async copyText(text: string): Promise<boolean> {
    const clipboard = navigator.clipboard as Clipboard | undefined;

    if (!clipboard || typeof clipboard.writeText !== 'function') {
      return this.copyTextWithSelection(text);
    }

    try {
      await clipboard.writeText(text);
    } catch {
      return this.copyTextWithSelection(text);
    }

    return true;
  }

  private copyTextWithSelection(text: string): boolean {
    const textarea = this.document.createElement('textarea');

    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.inset = '0 auto auto 0';
    textarea.style.opacity = '0';
    this.document.body.append(textarea);
    textarea.focus();
    textarea.select();

    try {
      return this.document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }

  private setCopyButtonState(button: HTMLButtonElement, copied: boolean): void {
    button.classList.toggle(CODE_COPY_COPIED_CLASS, copied);
    button.textContent = copied ? CODE_COPIED_TEXT : CODE_COPY_TEXT;
    button.setAttribute('aria-label', copied ? CODE_COPIED_LABEL : CODE_COPY_LABEL);

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
