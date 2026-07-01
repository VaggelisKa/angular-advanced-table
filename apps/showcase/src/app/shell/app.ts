import { DOCUMENT } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { resolveFocusTrapTarget } from './utils/app.util';
import type { ShowcaseTheme } from '../common/showcase-theme.type';
import { ShowcaseThemeStore } from '../domain-logic/showcase-theme';
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
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton = viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');

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
