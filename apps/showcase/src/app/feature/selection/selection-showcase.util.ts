import type { RowSelectionState } from '@tanstack/angular-table';

import type { RowSelectionSource } from './selection-showcase.type';

export const computeRowSelection = (
  source: RowSelectionSource,
  previous: { readonly source: RowSelectionSource; readonly value: RowSelectionState } | undefined
): RowSelectionState => {
  // Switching selection mode starts the new mode with an empty selection.
  if (previous && previous.source.multiple !== source.multiple) {
    return {};
  }

  // Same mode: keep rows that still exist so the selection self-heals after data changes.
  const previousSelection = previous?.value ?? {};
  const next: RowSelectionState = {};

  for (const id of Object.keys(previousSelection)) {
    if (previousSelection[id] && source.rowIds.has(id)) {
      next[id] = true;
    }
  }

  return next;
};
