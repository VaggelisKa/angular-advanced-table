import { DOCUMENT } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { isApplePlatform, resolveFocusTrapTarget } from './app.util';
import { ShowcaseWebMcp } from '../mcp/webmcp';
import { DocsSearchDialog } from '../search/docs-search-dialog';
import { DocsSearchStore } from '../search/docs-search.store';
import { ShowcaseThemeStore } from '../theme/showcase-theme';
import type { ShowcaseTheme } from '../theme/showcase-theme.type';
import { NavTree } from './nav-tree/nav-tree';

@Component({
  selector: 'app-root',
  imports: [DocsSearchDialog, NavTree, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)'
  }
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly searchStore = inject(DocsSearchStore);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly webMcp = inject(ShowcaseWebMcp);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton = viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');
  private readonly searchTriggerDesktop = viewChild<ElementRef<HTMLButtonElement>>('searchTriggerDesktop');
  private searchOpener: HTMLElement | null = null;

  protected readonly mobileNavOpen = signal(false);
  protected readonly searchOpen = signal(false);
  /* SSR-safe platform hint: default to the non-Apple shortcut and refine after
     the first browser render, because `navigator` must not be read on the server. */
  protected readonly searchShortcutHint = signal('Ctrl K');
  protected readonly searchAriaKeyshortcuts = signal('Control+K');
  protected readonly theme = this.themeStore.theme;

  public constructor() {
    this.webMcp.initialize();

    afterNextRender(() => {
      if (isApplePlatform(this.document.defaultView?.navigator)) {
        this.searchShortcutHint.set('⌘ K');
        this.searchAriaKeyshortcuts.set('Meta+K');
      }
    });
  }

  protected setTheme(theme: ShowcaseTheme): void {
    this.themeStore.setTheme(theme);
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSearch();
    }
  }

  protected toggleSearch(): void {
    if (this.searchOpen()) {
      this.closeSearch(true);

      return;
    }

    this.openSearch();
  }

  protected openSearch(): void {
    /* The search dialog is the only modal on screen: a shortcut or drawer
       trigger press while the mobile nav drawer is open closes the drawer
       first, without moving focus back to the hamburger. */
    this.closeMobileNav(false);

    const activeElement = this.document.activeElement;

    this.searchOpener = activeElement instanceof HTMLElement ? activeElement : null;
    this.preloadSearch();
    this.searchOpen.set(true);
  }

  protected closeSearch(restoreFocus: boolean): void {
    if (!this.searchOpen()) {
      return;
    }

    this.searchOpen.set(false);

    const opener = this.searchOpener;

    this.searchOpener = null;

    if (restoreFocus) {
      this.focusAfterRender(() => opener ?? this.searchTriggerDesktop()?.nativeElement);
    }
  }

  protected preloadSearch(): void {
    this.searchStore.preloadCorpus();
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

    const target = resolveFocusTrapTarget(panel, this.document.activeElement, event.shiftKey);

    if (target) {
      event.preventDefault();
      target.focus();
    }
  }

  private focusAfterRender(getElement: () => HTMLElement | undefined): void {
    afterNextRender({ write: () => getElement()?.focus() }, { injector: this.injector });
  }
}
