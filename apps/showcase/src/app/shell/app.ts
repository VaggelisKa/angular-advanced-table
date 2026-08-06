import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import type { ElementRef, TemplateRef } from '@angular/core';
import { Component, DestroyRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { isApplePlatform } from './app.util';
import { ShowcaseWebMcp } from '../mcp/webmcp';
import { DocsSearchDialog } from '../search/docs-search-dialog';
import { DocsSearchStore } from '../search/docs-search.store';
import { ShowcaseThemeStore } from '../theme/showcase-theme';
import type { ShowcaseTheme } from '../theme/showcase-theme.type';
import { NavTree } from './nav-tree/nav-tree';

/**
 * Dialog result contract for both shell modals: `false` means "close without
 * moving focus" (a result was activated or another modal takes over), while
 * `true` and CDK-initiated closes (Escape, backdrop click → `undefined`)
 * restore focus to the trigger.
 */
type ShellDialogResult = boolean;

@Component({
  selector: 'app-root',
  imports: [NavTree, NgTemplateOutlet, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)'
  }
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly searchStore = inject(DocsSearchStore);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly webMcp = inject(ShowcaseWebMcp);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavDialog = viewChild.required<TemplateRef<unknown>>('mobileNavDialog');
  private readonly searchTriggerDesktop = viewChild<ElementRef<HTMLButtonElement>>('searchTriggerDesktop');
  private readonly searchTriggerMobile = viewChild<ElementRef<HTMLButtonElement>>('searchTriggerMobile');
  private mobileNavRef: DialogRef<ShellDialogResult> | null = null;
  private searchRef: DialogRef<ShellDialogResult> | null = null;

  protected readonly mobileNavOpen = signal(false);
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
    if (this.searchRef) {
      this.searchRef.close(true);

      return;
    }

    this.openSearch();
  }

  protected openSearch(): void {
    if (this.searchRef) {
      return;
    }

    /* Capture the opener before the drawer closes: the drawer's dialog content
       is destroyed on close, so `activeElement` would already have fallen back
       to `body` afterwards. */
    const activeElement = this.document.activeElement;
    const opener = activeElement instanceof HTMLElement ? activeElement : null;

    /* The search dialog is the only modal on screen: a shortcut or drawer
       trigger press while the mobile nav drawer is open closes the drawer
       first, without moving focus back to the hamburger. */
    this.closeMobileNav(false);
    this.preloadSearch();

    /* CDK owns focus trap, aria-hiding of the page behind, Escape and backdrop
       dismissal, and (block-strategy) scroll locking. Focus restore stays
       manual: CDK would restore to the opener even when it is no longer
       visible (the trigger inside the closed mobile drawer), so the fallback
       chain below finds the first trigger that actually takes focus. */
    const searchRef = this.dialog.open<ShellDialogResult>(DocsSearchDialog, {
      ariaLabel: 'Search documentation',
      ariaModal: true,
      /* The dialog component moves focus to its combobox input itself, so the
         container must not re-capture it. */
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'docs-search-overlay-pane',
      backdropClass: 'docs-search-overlay-backdrop'
    });

    /* Stable automation hook on the CDK-owned backdrop. */
    searchRef.overlayRef.backdropElement?.setAttribute('data-testid', 'docs-search-backdrop');
    this.searchRef = searchRef;

    /* Scoped to the component lifetime: when the whole app tears down, the
       Dialog service force-closes open dialogs and focus restoration must not
       schedule render hooks on a destroyed injector. */
    searchRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((restoreFocus) => {
      this.searchRef = null;

      if (restoreFocus !== false) {
        this.focusFirstAfterRender(() => [
          opener,
          this.searchTriggerDesktop()?.nativeElement,
          this.searchTriggerMobile()?.nativeElement
        ]);
      }
    });
  }

  protected preloadSearch(): void {
    this.searchStore.preloadCorpus();
  }

  protected toggleMobileNav(): void {
    if (this.mobileNavRef) {
      this.closeMobileNav();

      return;
    }

    this.openMobileNav();
  }

  protected openMobileNav(): void {
    if (this.mobileNavRef) {
      return;
    }

    /* Autofocus targets the close button by selector (matching the previous
       hand-rolled focus capture) so the capture stays deterministic even where
       CDK's layout-based tabbable detection cannot run. */
    const mobileNavRef = this.dialog.open<ShellDialogResult>(this.mobileNavDialog(), {
      ariaLabel: 'Docs and examples',
      ariaModal: true,
      autoFocus: '.showcase-nav-close',
      restoreFocus: false,
      panelClass: 'showcase-nav-overlay-pane',
      backdropClass: 'showcase-nav-overlay-backdrop'
    });

    this.mobileNavRef = mobileNavRef;
    this.mobileNavOpen.set(true);

    mobileNavRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((restoreFocus) => {
      this.mobileNavRef = null;
      this.mobileNavOpen.set(false);

      if (restoreFocus !== false) {
        this.focusAfterRender(() => this.mobileMenuButton()?.nativeElement);
      }
    });
  }

  protected closeMobileNav(restoreFocus = true): void {
    this.mobileNavRef?.close(restoreFocus);
  }

  private focusAfterRender(getElement: () => HTMLElement | undefined): void {
    afterNextRender({ write: () => getElement()?.focus() }, { injector: this.injector });
  }

  private focusFirstAfterRender(getCandidates: () => readonly (HTMLElement | null | undefined)[]): void {
    afterNextRender(
      {
        write: () => {
          for (const candidate of getCandidates()) {
            candidate?.focus();

            if (candidate && this.document.activeElement === candidate) {
              return;
            }
          }
        }
      },
      { injector: this.injector }
    );
  }
}
