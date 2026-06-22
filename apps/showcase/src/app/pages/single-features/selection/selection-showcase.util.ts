import type { RowSelectionState } from '@tanstack/angular-table';

export type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

export type RowSelectionSource = {
  readonly rowIds: ReadonlySet<string>;
  readonly multiple: boolean;
};

export const getDemoItemRowId = (row: DemoItem): string => row.id;

export const computeRowSelection = (
  source: RowSelectionSource,
  previous:
    | { readonly source: RowSelectionSource; readonly value: RowSelectionState }
    | undefined,
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
