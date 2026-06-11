import { afterRenderEffect, Directive, ElementRef, inject } from '@angular/core';
import { Menu } from '@angular/aria/menu';

/** Minimum gap kept between the submenu and the viewport edge, in px. */
const NAT_TOOLBAR_SUBMENU_VIEWPORT_GUTTER = 4;

/**
 * INTERNAL edge-aware placement for the More-menu submenus.
 *
 * The submenu is CSS-positioned beside the More panel (inline-start flow side,
 * see `.more-menu--submenu`). The More button sits at the toolbar's end, so the
 * default placement routinely lands outside the viewport. Whenever the submenu
 * opens, this directive measures it at the default placement and then:
 *
 * 1. mirrors it to the opposite inline side (`data-edge-flip`) when the default
 *    side leaves the viewport and the mirrored side overflows less, and
 * 2. translates away any residual overflow on both axes (small viewports where
 *    neither side fully fits, and bottom-edge overflow).
 */
@Directive({
  selector: '[natToolbarSubmenuPosition]',
})
export class NatToolbarSubmenuPosition {
  private readonly menu = inject<Menu<string>>(Menu, { self: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      if (!this.menu.visible()) return;

      const host = this.elementRef.nativeElement;

      // Reset before measuring so reopening at a new toolbar position never
      // inherits the previous placement.
      host.removeAttribute('data-edge-flip');
      host.style.removeProperty('translate');

      const defaultOverflow = this.inlineOverflow(host);

      if (defaultOverflow > 0) {
        host.setAttribute('data-edge-flip', '');

        if (this.inlineOverflow(host) >= defaultOverflow) {
          host.removeAttribute('data-edge-flip');
        }
      }

      this.clampIntoViewport(host);
    });
  }

  /** Total horizontal viewport overflow (both edges) at the current placement. */
  private inlineOverflow(host: HTMLElement): number {
    const rect = host.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const gutter = NAT_TOOLBAR_SUBMENU_VIEWPORT_GUTTER;

    return Math.max(0, gutter - rect.left) + Math.max(0, rect.right - (viewportWidth - gutter));
  }

  /** Translates away residual overflow; never pushes the start/top edge off-screen. */
  private clampIntoViewport(host: HTMLElement): void {
    const rect = host.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gutter = NAT_TOOLBAR_SUBMENU_VIEWPORT_GUTTER;

    let deltaX = 0;
    if (rect.right > viewportWidth - gutter) {
      deltaX = viewportWidth - gutter - rect.right;
    } else if (rect.left < gutter) {
      deltaX = gutter - rect.left;
    }
    // Keep the start edge reachable when the submenu is wider than the viewport.
    deltaX = Math.max(deltaX, gutter - rect.left);

    let deltaY = 0;
    if (rect.bottom > viewportHeight - gutter) {
      deltaY = Math.max(viewportHeight - gutter - rect.bottom, gutter - rect.top);
    }

    if (deltaX !== 0 || deltaY !== 0) {
      host.style.translate = `${deltaX}px ${deltaY}px`;
    }
  }
}
