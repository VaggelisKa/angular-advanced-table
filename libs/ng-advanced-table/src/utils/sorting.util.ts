import type { ColumnFiltersState, SortingState } from '@tanstack/angular-table';

/** Removes duplicate sort entries by id, keeping the first occurrence. */
const dedupeSortEntries = (sorting: SortingState): SortingState => {
  const seen = new Set<string>();
  const deduped: SortingState = [];

  for (const entry of sorting) {
    if (seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    deduped.push(entry);
  }

  return deduped;
};

export const normalizeSortingState = (sorting: SortingState, allowMulti: boolean): SortingState => {
  if (!sorting.length) {
    return sorting;
  }

  const deduped = dedupeSortEntries(sorting);

  if (allowMulti) {
    // No duplicates removed → preserve the original reference for change detection.
    return deduped.length === sorting.length ? sorting : deduped;
  }

  const normalized = deduped.slice(0, 1);

  if (normalized.length === sorting.length && normalized[0] === sorting[0]) {
    return sorting;
  }

  const single = normalized[0];
  const original = sorting[0];

  if (normalized.length === 1 && sorting.length === 1 && single.id === original.id && single.desc === original.desc) {
    return sorting;
  }

  return normalized;
};

export const serializeSorting = (sorting: SortingState): string => {
  return sorting.map((entry) => `${entry.id}:${entry.desc ? 'desc' : 'asc'}`).join('|');
};

// Filter values are expected to be JSON-serializable consumer state. This guard
// only keeps accessibility snapshotting from crashing when a consumer passes an
// unsupported value; it does not try to define semantics for arbitrary objects.
const serializeColumnFilterValue = (value: unknown): string => {
  try {
    const serialized = JSON.stringify(value) as string | undefined;

    return serialized ?? String(value);
  } catch {
    return '[unserializable]';
  }
};

export const serializeColumnFilters = (columnFilters: ColumnFiltersState): string => {
  return columnFilters.map((entry) => `${entry.id}:${serializeColumnFilterValue(entry.value)}`).join('|');
};

/** Maps a `desc` flag to its sort-direction announcement value. */
export const sortDirection = (desc: boolean): 'ascending' | 'descending' => (desc ? 'descending' : 'ascending');

/** Maps active filter sources to the announcement filter-state value. */
export const resolveFilterState = (
  hasGlobalFilter: boolean,
  hasColumnFilters: boolean
): 'global-and-column' | 'global' | 'column' | 'none' => {
  if (hasGlobalFilter) {
    return hasColumnFilters ? 'global-and-column' : 'global';
  }

  return hasColumnFilters ? 'column' : 'none';
};
