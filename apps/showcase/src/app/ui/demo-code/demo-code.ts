import type { ElementRef } from '@angular/core';
import { Component, afterRenderEffect, computed, input, signal, viewChildren } from '@angular/core';

import { highlightElement } from '../../shared/prism.util';

type DemoSnippet = {
  readonly id: string;
  readonly label: string;
  readonly language: string;
  readonly code: string;
};

let nextDemoExampleId = 0;

/**
 * Preview/Code tabs for gallery demo pages, mirroring the docs example tabs.
 *
 * The live demo is projected content shown in the Preview panel — it stays in
 * the DOM while hidden, so demo state survives toggling. The Code panel
 * renders one Prism-highlighted block per part behind HTML / TS / Styles
 * tabs; each part is optional.
 */
@Component({
  selector: 'app-demo-code',
  templateUrl: './demo-code.html',
  styleUrl: './demo-code.css'
})
export class DemoCode {
  /** Template/markup part of the example. */
  public readonly markup = input('');
  /** TypeScript part of the example. */
  public readonly typescript = input('');
  /** CSS part of the example. */
  public readonly css = input('');

  protected readonly demoId = `demo-example-${nextDemoExampleId++}`;
  protected readonly activePanel = signal<'preview' | 'code'>('preview');
  protected readonly activeSnippetId = signal('');

  protected readonly snippets = computed<DemoSnippet[]>(() =>
    [
      { id: 'html', label: 'HTML', language: 'markup', code: this.markup().trim() },
      { id: 'ts', label: 'TS', language: 'typescript', code: this.typescript().trim() },
      { id: 'styles', label: 'Styles', language: 'css', code: this.css().trim() }
    ].filter((snippet) => snippet.code)
  );

  protected readonly selectedSnippetId = computed(() => {
    const snippets = this.snippets();
    const activeSnippetId = this.activeSnippetId();
    const activeSnippetExists = snippets.some((snippet) => snippet.id === activeSnippetId);

    return activeSnippetExists ? activeSnippetId : (snippets.at(0)?.id ?? '');
  });

  private readonly codeElements = viewChildren<ElementRef<HTMLElement>>('codeEl');

  public constructor() {
    // Re-highlight whenever the inputs change, after Angular writes textContent.
    afterRenderEffect(() => {
      this.snippets();

      for (const codeElement of this.codeElements()) {
        highlightElement(codeElement.nativeElement);
      }
    });
  }

  protected snippetTabId(snippet: DemoSnippet): string {
    return `${this.demoId}-${snippet.id}-tab`;
  }

  protected snippetPanelId(snippet: DemoSnippet): string {
    return `${this.demoId}-${snippet.id}-panel`;
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

  private getNextSnippetId(key: string, currentSnippetId: string): string | undefined {
    const snippets = this.snippets();

    switch (key) {
      case 'Home':
        return snippets.at(0)?.id;
      case 'End':
        return snippets.at(-1)?.id;
      case 'ArrowLeft':
      case 'ArrowRight': {
        const direction = key === 'ArrowRight' ? 1 : -1;
        const currentIndex = snippets.findIndex((snippet) => snippet.id === currentSnippetId);

        return snippets[(currentIndex + direction + snippets.length) % snippets.length].id;
      }
      default:
        return undefined;
    }
  }
}
