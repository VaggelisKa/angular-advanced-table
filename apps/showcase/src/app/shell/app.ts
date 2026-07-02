import { DOCUMENT } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { resolveFocusTrapTarget } from './app.util';
import { ShowcaseWebMcp } from './app.webmcp';
import { ShowcaseThemeStore } from '../theme/showcase-theme';
import type { ShowcaseTheme } from '../theme/showcase-theme.type';
import { NavTree } from './nav-tree/nav-tree';

@Component({
  selector: 'app-root',
  imports: [NavTree, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly webMcp = inject(ShowcaseWebMcp);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton = viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');

  protected readonly mobileNavOpen = signal(false);
  protected readonly theme = this.themeStore.theme;

  public constructor() {
    this.webMcp.initialize();
  }

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
