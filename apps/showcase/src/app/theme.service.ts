import { Injectable, signal } from '@angular/core';

export type ShowcaseTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'nat-showcase-theme';

const readInitialTheme = (): ShowcaseTheme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Storage access can throw in private/sandboxed contexts.
  }

  const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

  return media.matches ? 'dark' : 'light';
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly theme = signal<ShowcaseTheme>(readInitialTheme());

  private setTheme(theme: ShowcaseTheme): void {
    this.theme.set(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage access can throw in private/sandboxed contexts.
    }
  }

  private toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }
}
