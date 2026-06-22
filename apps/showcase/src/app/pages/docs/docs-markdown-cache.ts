import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export type DocsMarkdownStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface DocsMarkdownState {
  readonly status: DocsMarkdownStatus;
  readonly content: string;
  readonly error?: unknown;
}

const EMPTY_DOCS_MARKDOWN_STATE: DocsMarkdownState = {
  status: 'idle',
  content: '',
};

@Injectable({ providedIn: 'root' })
export class DocsMarkdownCache {
  private readonly http = inject(HttpClient);
  private readonly states = signal<ReadonlyMap<string, DocsMarkdownState>>(new Map());

  getState(markdownPath: string): DocsMarkdownState {
    return this.states().get(markdownPath) ?? EMPTY_DOCS_MARKDOWN_STATE;
  }

  load(markdownPath: string): void {
    const currentState = this.getState(markdownPath);

    if (currentState.status === 'loading' || currentState.status === 'loaded') {
      return;
    }

    this.setState(markdownPath, {
      status: 'loading',
      content: currentState.content,
    });

    this.http.get(markdownPath, { responseType: 'text' }).subscribe({
      next: (content) => {
        this.setState(markdownPath, {
          status: 'loaded',
          content,
        });
      },
      error: (error: unknown) => {
        this.setState(markdownPath, {
          status: 'error',
          content: currentState.content,
          error,
        });
      },
    });
  }

  preload(markdownPaths: readonly string[]): void {
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
}
