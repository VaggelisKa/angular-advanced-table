import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ShowcaseThemeStore, type ShowcaseTheme } from './showcase-theme';

const showcaseExamples = [
  {
    label: 'Multiple features',
    description: 'Kitchen sink demo',
    path: '/examples/multiple-features',
  },
  {
    label: 'Table builder',
    description: 'Interactive config',
    path: '/builder',
  },
  {
    label: 'Sorting',
    description: 'Column sorting',
    path: '/sorting',
  },
  {
    label: 'Column pinning',
    description: 'Sticky boundary pinning',
    path: '/pinning',
  },
  {
    label: 'Column reordering',
    description: 'Drag-and-drop headers',
    path: '/reordering',
  },
  {
    label: 'Pagination',
    description: 'Row-based pagination',
    path: '/pagination',
  },
  {
    label: 'Column visibility',
    description: 'Dynamic column display',
    path: '/visibility',
  },
  {
    label: 'Global search',
    description: 'Fuzzy filter mapping',
    path: '/search',
  },
  {
    label: 'Table states',
    description: 'Loading empty error',
    path: '/states',
  },
  {
    label: 'Sticky header',
    description: 'Fixed viewport headers',
    path: '/sticky-header',
  },
  {
    label: 'Sticky header (CSS Grid)',
    description: 'Fixed viewport grid headers',
    path: '/sticky-header-grid-poc',
  },
  {
    label: 'Toolbar',
    description: 'Slot-based keyboard toolbar',
    path: '/toolbar',
  },
  {
    label: 'Keyboard interaction',
    description: 'Grid cell navigation',
    path: '/keyboard-interaction',
  },
  {
    label: 'Column resizing',
    description: 'Drag & keyboard widths',
    path: '/resizing',
  },
  {
    label: 'Row selection',
    description: 'Checkbox row selection',
    path: '/selection',
  },
  {
    label: 'Sorting with pinned columns',
    description: 'Fixed company and total columns',
    path: '/examples/simple-sorting',
  },
];

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton =
    viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');

  protected readonly examples = showcaseExamples;
  protected readonly exactLinkMatch = { exact: true };
  protected readonly mobileNavOpen = signal(false);
  protected readonly theme = this.themeStore.theme;

  protected setTheme(theme: ShowcaseTheme): void {
    this.themeStore.setTheme(theme);
  }

  protected toggleMobileNav(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav();
      return;
    }

    this.openMobileNav();
  }

  protected openMobileNav(): void {
    this.mobileNavOpen.set(true);
    this.focusAfterRender(() => this.mobileNavCloseButton()?.nativeElement);
  }

  protected closeMobileNav(restoreFocus = true): void {
    if (!this.mobileNavOpen()) {
      return;
    }

    this.mobileNavOpen.set(false);

    if (restoreFocus) {
      this.focusAfterRender(() => this.mobileMenuButton()?.nativeElement);
    }
  }

  protected trapMobileNavFocus(event: KeyboardEvent): void {
    if (!this.mobileNavOpen() || event.key !== 'Tab') {
      return;
    }

    const panel = this.mobileNavPanel()?.nativeElement;

    if (!panel) {
      return;
    }

    const focusableElements = this.getFocusableElements(panel);
    const firstElement = focusableElements.at(0);
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      return;
    }

    const activeElement = this.document.activeElement;

    if (!(activeElement instanceof HTMLElement) || !panel.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((element) => element.tabIndex >= 0);
  }

  private focusAfterRender(getElement: () => HTMLElement | undefined): void {
    afterNextRender({ write: () => getElement()?.focus() }, { injector: this.injector });
  }
}
