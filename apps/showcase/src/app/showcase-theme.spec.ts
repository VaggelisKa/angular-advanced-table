import { TestBed } from '@angular/core/testing';

import { ShowcaseThemeStore } from './showcase-theme';

const themeStorageKey = 'nat-showcase-theme';

const clearThemeState = (): void => {
  try {
    globalThis.localStorage.removeItem(themeStorageKey);
  } catch {
    // ignore
  }

  document.documentElement.removeAttribute('data-theme');
};

describe('ShowcaseThemeStore', () => {
  let store: Record<string, string> = {};
  let originalLocalStorage: typeof globalThis.localStorage;

  beforeEach(() => {
    store = {};
    originalLocalStorage = globalThis.localStorage;
    const mockLocalStorage = {
      getItem: (key: string): string | null => store[key] || null,
      setItem: (key: string, value: string): void => {
        store[key] = value;
      },
      removeItem: (key: string): void => {
        Reflect.deleteProperty(store, key);
      },
      clear: (): void => {
        store = {};
      },
      length: 0,
      key: (): string | null => null
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
    clearThemeState();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true
    });
    clearThemeState();
  });

  it('should apply the stored theme to the document root when initialized', () => {
    globalThis.localStorage.setItem(themeStorageKey, 'dark');

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
