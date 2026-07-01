import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Routes } from '@angular/router';

import { App } from '../app';

export const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';

@Component({
  selector: 'app-test-example',
  template: 'Example route'
})
class TestExamplePage {}

const APP_TEST_ROUTES: Routes = [
  { path: '', pathMatch: 'full', component: TestExamplePage },
  { path: 'docs', pathMatch: 'full', component: TestExamplePage },
  { path: 'docs/quick-start', component: TestExamplePage },
  { path: 'examples', pathMatch: 'full', component: TestExamplePage },
  { path: 'examples/multiple-features', component: TestExamplePage }
];

const createTestStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length(): number {
      return values.size;
    },
    clear(): void {
      values.clear();
    },
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    key(index: number): string | null {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      values.delete(key);
    },
    setItem(key: string, value: string): void {
      values.set(key, value);
    }
  };
};

export const configureAppTestBed = async (): Promise<void> => {
  globalThis.history.replaceState(null, '', '/');
  vi.stubGlobal('localStorage', createTestStorage());

  try {
    globalThis.localStorage.removeItem('nat-showcase-theme');
    globalThis.localStorage.removeItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);
  } catch {
    // ignore
  }

  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideZonelessChangeDetection(), provideRouter(APP_TEST_ROUTES)]
  }).compileComponents();
};

export const readStoredExpandedNavTreeIds = (): string[] => {
  const parsed: unknown = JSON.parse(globalThis.localStorage.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY) ?? '[]');

  return Array.isArray(parsed) ? parsed.filter((sectionId): sectionId is string => typeof sectionId === 'string') : [];
};

export const waitForFocusHandoff = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve));
};

export const getElement = <T extends Element>(container: HTMLElement, selector: string): T => {
  const element = container.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Element not found: ${selector}`);
  }

  return element;
};

export const queryText = (container: HTMLElement, selector: string): string | null | undefined => {
  return container.querySelector(selector)?.textContent;
};
