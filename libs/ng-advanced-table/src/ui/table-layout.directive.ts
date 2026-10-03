import type { Signal } from '@angular/core';
import { Directive, ElementRef, Renderer2, afterRenderEffect, inject, input } from '@angular/core';

import type { TableColumnRenderState } from '../common/column-render.type';

/** Resize-guide geometry consumed by {@link NatTableResizeGuide}. */
type NatTableResizeGuideGeometry = {
  readonly left: number;
  readonly offset: number;
};

/**
 * Host-styles a header cell's pinned offsets and width bounds. Moving these
 * runtime values into `host` (instead of template `[style.*]` bindings) keeps
 * the template free of inline styles while rendering identically. The input
 * alias equals the selector, so `no-input-rename` permits it without a rename.
 */
@Directive({
  selector: 'th[natTableHeaderCellLayout]',
  host: {
    '[style.left.px]': 'state()?.left',
    '[style.right.px]': 'state()?.right',
    '[style.width]': 'state()?.headerWidth',
    '[style.min-width]': 'state()?.headerMinWidth',
    '[style.max-width]': 'state()?.headerMaxWidth'
  }
})
export class NatTableHeaderCellLayout {
  public readonly state = input.required<TableColumnRenderState | undefined>({
    alias: 'natTableHeaderCellLayout'
  });
}

/**
 * Host-styles a body cell's pinned offsets, width bounds, height, and the
 * `--nat-table-cell-max-lines` clamp custom property. Applied to both the
 * row-header `<th>` and the data `<td>`.
 */
@Directive({
  selector: '[natTableBodyCellLayout]',
  host: {
    '[style.--nat-table-cell-max-lines]': 'state()?.cellMaxLines',
    '[style.height]': 'state()?.cellHeight',
    '[style.left.px]': 'state()?.left',
    '[style.right.px]': 'state()?.right',
    '[style.width]': 'state()?.width',
    '[style.min-width]': 'state()?.minWidth',
    '[style.max-width]': 'state()?.maxWidth'
  }
})
export class NatTableBodyCellLayout {
  public readonly state = input.required<TableColumnRenderState | undefined>({
    alias: 'natTableBodyCellLayout'
  });
}

/**
 * Host-styles an element's pixel width from a runtime value. Used for both the
 * authoritative-layout `<table>` width and each `<col>` width; a `null`/absent
 * value clears the inline width exactly as the previous binding did.
 */
@Directive({
  selector: '[natTablePxWidth]',
  host: {
    '[style.width.px]': 'natTablePxWidth()'
  }
})
export class NatTablePxWidth {
  public readonly natTablePxWidth = input.required<number | null | undefined>();
}

/** Host-styles an element's pixel height from a runtime layout value. */
@Directive({
  selector: '[natTablePxHeight]',
  host: {
    '[style.height.px]': 'natTablePxHeight()'
  }
})
export class NatTablePxHeight {
  public readonly natTablePxHeight = input.required<number | null | undefined>();
}

/**
 * Positions the column-resize drag guide: its left anchor plus the live
 * `translateX` that follows the pointer during a drag, hidden while the
 * geometry is `null`.
 *
 * Takes the geometry *signal* and applies it from an `afterRenderEffect`, so a
 * pointer move only restyles this element. Reading the geometry in the table
 * template (or in host bindings, which run in the parent view) would re-check
 * every rendered row and cell on every pointer move.
 */
@Directive({
  selector: '[natTableResizeGuide]'
})
export class NatTableResizeGuide {
  public readonly guide = input.required<Signal<NatTableResizeGuideGeometry | null>>({
    alias: 'natTableResizeGuide'
  });

  public constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);

    afterRenderEffect({
      write: () => {
        const guide = this.guide()();

        if (guide === null) {
          renderer.setAttribute(element, 'hidden', '');

          return;
        }

        renderer.removeAttribute(element, 'hidden');
        renderer.setStyle(element, 'left', `${guide.left}px`);
        renderer.setStyle(element, 'transform', `translateX(${guide.offset}px)`);
      }
    });
  }
}
