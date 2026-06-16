import { Injectable, signal } from '@angular/core';

export type ShowcaseTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'nat-showcase-theme';

@Injectable({
  providedIn: 'root',
})
export class ShowcaseThemeStore {
  private readonly themeState = signal<ShowcaseTheme>(readInitialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    applyThemeToDocument(this.themeState());
  }

  setTheme(theme: ShowcaseTheme): void {
    this.themeState.set(theme);
    persistTheme(theme);
    applyThemeToDocument(theme);
  }
}

function readInitialTheme(): ShowcaseTheme {
  try {
    const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Storage access can throw in private/sandboxed contexts; fall through to the media query.
  }

  const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  return media?.matches ? 'dark' : 'light';
}

function persistTheme(theme: ShowcaseTheme): void {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / privacy-mode failures.
  }
}

function applyThemeToDocument(theme: ShowcaseTheme): void {
  globalThis.document?.documentElement.setAttribute('data-theme', theme);
}
