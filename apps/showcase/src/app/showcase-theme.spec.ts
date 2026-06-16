import { TestBed } from '@angular/core/testing';

import { ShowcaseThemeStore } from './showcase-theme';

const themeStorageKey = 'nat-showcase-theme';

describe('ShowcaseThemeStore', () => {
  beforeEach(() => {
    clearThemeState();
  });

  afterEach(() => {
    clearThemeState();
  });

  it('should apply the stored theme to the document root when initialized', () => {
    globalThis.localStorage?.setItem(themeStorageKey, 'dark');

    const themeStore = TestBed.inject(ShowcaseThemeStore);

    expect(themeStore.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should keep the document root theme synchronized with updates', () => {
    const themeStore = TestBed.inject(ShowcaseThemeStore);

    themeStore.setTheme('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    themeStore.setTheme('light');

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

function clearThemeState(): void {
  try {
    globalThis.localStorage?.removeItem(themeStorageKey);
  } catch {
    // ignore
  }

  document.documentElement.removeAttribute('data-theme');
}
