import { Directive, computed, input } from '@angular/core';

import type { TableColumnRenderState } from '../common/table.type';

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

/**
 * Host-styles the column-resize drag guide: its left anchor plus the live
 * `translateX` that follows the pointer during a drag.
 */
@Directive({
  selector: '[natTableResizeGuide]',
  host: {
    '[style.left.px]': 'guide().left',
    '[style.transform]': 'transform()'
  }
})
export class NatTableResizeGuide {
  public readonly guide = input.required<NatTableResizeGuideGeometry>({
    alias: 'natTableResizeGuide'
  });

  protected readonly transform = computed(() => `translateX(${this.guide().offset}px)`);
}
