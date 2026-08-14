import type { NatTableScrollTargetContext } from '../common/table-virtualization.type';

/**
 * Resolves the scroll offset that brings a fixed-height row into view: 'start'
 * lands it just below the sticky overlay, 'end' at the viewport bottom, and
 * 'auto' scrolls the minimum needed — or not at all (`null`) when the row is
 * already fully visible below the sticky overlay.
 */
export const resolveNatTableScrollTarget = (context: NatTableScrollTargetContext): number | null => {
  const { align, scrollTop, rowTop, rowHeight, stickyOverlayHeight, viewportHeight } = context;
  const startTarget = Math.max(0, rowTop - stickyOverlayHeight);
  const endTarget = Math.max(0, rowTop + rowHeight - viewportHeight);

  if (align === 'start') {
    return startTarget;
  }

  if (align === 'end') {
    return endTarget;
  }

  if (rowTop < scrollTop + stickyOverlayHeight) {
    return startTarget;
  }

  return rowTop + rowHeight > scrollTop + viewportHeight ? endTarget : null;
};
