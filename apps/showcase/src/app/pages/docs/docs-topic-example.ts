import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';

import type { DocsCodeSnippet, DocsTopicExampleBlock } from './docs-topic.types';

const COPY_LABEL = 'Copy example code';
const COPIED_LABEL = 'Copied example code';
const COPY_RESET_DELAY_MS = 2000;

type PrismGlobal = typeof globalThis & {
  Prism?: {
    highlightAllUnder(element: Element | Document): void;
  };
};

@Component({
  selector: 'app-docs-topic-example',
  imports: [NgComponentOutlet],
  templateUrl: './docs-topic-example.html',
  styleUrl: './docs-topic-example.css'
})
export class DocsTopicExample {
  private readonly document = inject(DOCUMENT);
  private readonly codePanel = viewChild<ElementRef<HTMLElement>>('codePanel');

  public readonly example = input.required<DocsTopicExampleBlock>();

  protected readonly activePanel = signal<'preview' | 'code'>('preview');
  protected readonly activeSnippetId = signal('');
  protected readonly copied = signal(false);
  private copiedResetTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly selectedSnippetId = computed(() => {
    const snippets = this.example().snippets;
    const activeSnippetId = this.activeSnippetId();
    const activeSnippetExists = snippets.some((snippet) => snippet.id === activeSnippetId);

    return activeSnippetExists ? activeSnippetId : snippets[0].id;
  });

  protected readonly activeSnippet = computed(() => {
    const snippets = this.example().snippets;
    const selectedSnippetId = this.selectedSnippetId();
    const activeSnippet = snippets.find((snippet) => snippet.id === selectedSnippetId);

    return activeSnippet ?? snippets[0];
  });

  protected readonly codeClass = computed(() => `language-${this.activeSnippet().language}`);
  protected readonly copyButtonLabel = computed(() => (this.copied() ? COPIED_LABEL : COPY_LABEL));
  protected readonly headingId = computed(() => `docs-example-${this.example().id}-title`);
  protected readonly previewTabId = computed(() => `docs-example-${this.example().id}-preview-tab`);
  protected readonly codeTabId = computed(() => `docs-example-${this.example().id}-code-tab`);
  protected readonly previewPanelId = computed(() => `docs-example-${this.example().id}-preview-panel`);
  protected readonly codePanelId = computed(() => `docs-example-${this.example().id}-code-panel`);

  public constructor() {
    effect(() => {
      if (this.activePanel() !== 'code') {
        return;
      }

      const snippetId = this.activeSnippet().id;

      queueMicrotask(() => {
        if (this.activeSnippet().id === snippetId) {
          this.highlightCodePanel();
        }
      });
    });
  }

  protected snippetTabId(snippet: DocsCodeSnippet): string {
    return `docs-example-${this.example().id}-${snippet.id}-tab`;
  }

  protected snippetPanelId(snippet: DocsCodeSnippet): string {
    return `docs-example-${this.example().id}-${snippet.id}-panel`;
  }

  protected switchPanelFromKeyboard(event: KeyboardEvent, currentPanel: 'preview' | 'code'): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    this.activePanel.set(currentPanel === 'preview' ? 'code' : 'preview');
  }

  protected switchSnippetFromKeyboard(event: KeyboardEvent, currentSnippetId: string): void {
    const nextSnippetId = this.getNextSnippetId(event.key, currentSnippetId);

    if (!nextSnippetId) {
      return;
    }

    event.preventDefault();
    this.activeSnippetId.set(nextSnippetId);
  }

  protected copyActiveSnippet(): void {
    void this.copyText(this.activeSnippet().code).then((copied) => this.setCopied(copied));
  }

  private getNextSnippetId(key: string, currentSnippetId: string): string | undefined {
    const snippets = this.example().snippets;

    switch (key) {
      case 'Home':
        return snippets[0].id;
      case 'End':
        return snippets.at(-1)?.id;
      case 'ArrowLeft':
      case 'ArrowRight':
        return snippets[this.getAdjacentSnippetIndex(key, currentSnippetId)].id;
      default:
        return undefined;
    }
  }

  private getAdjacentSnippetIndex(key: string, currentSnippetId: string): number {
    const snippets = this.example().snippets;
    const direction = key === 'ArrowRight' ? 1 : -1;
    const currentIndex = snippets.findIndex((snippet) => snippet.id === currentSnippetId);

    return (currentIndex + direction + snippets.length) % snippets.length;
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

  private setCopied(copied: boolean): void {
    this.copied.set(copied);

    if (!copied) {
      return;
    }

    if (this.copiedResetTimer) {
      clearTimeout(this.copiedResetTimer);
    }

    this.copiedResetTimer = setTimeout(() => this.copied.set(false), COPY_RESET_DELAY_MS);
  }

  private highlightCodePanel(): void {
    const codePanel = this.codePanel()?.nativeElement;
    const prism = (globalThis as PrismGlobal).Prism;

    if (!codePanel || typeof prism?.highlightAllUnder !== 'function') {
      return;
    }

    prism.highlightAllUnder(codePanel);
  }
}
