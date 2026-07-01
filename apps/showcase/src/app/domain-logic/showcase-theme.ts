import { DOCUMENT } from '@angular/common';
import { Injectable, afterNextRender, inject, signal } from '@angular/core';

import type { ShowcaseTheme } from '../common';

const THEME_STORAGE_KEY = 'nat-showcase-theme';

const persistTheme = (theme: ShowcaseTheme): void => {
  try {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / privacy-mode failures.
  }
};

const readInitialTheme = (): ShowcaseTheme => {
  try {
    const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Storage access can throw in private/sandboxed contexts; fall through to the media query.
  }

  if (typeof globalThis.matchMedia !== 'function') {
    return 'light';
  }

  const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

  return media.matches ? 'dark' : 'light';
};

@Injectable({
  providedIn: 'root'
})
export class ShowcaseThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly themeState = signal<ShowcaseTheme>('light');

  public readonly theme = this.themeState.asReadonly();

  public constructor() {
    afterNextRender({
      write: () => this.setThemeState(readInitialTheme())
    });
  }

  public setTheme(theme: ShowcaseTheme): void {
    this.setThemeState(theme);
    persistTheme(theme);
  }

  private setThemeState(theme: ShowcaseTheme): void {
    this.applyThemeToDocument(theme);
    this.themeState.set(theme);
  }

  private applyThemeToDocument(theme: ShowcaseTheme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
