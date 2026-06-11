import type { FilterFn, RowData } from '@tanstack/angular-table';

/** Filter input type a column declares through `meta.filter.type`. */
export type NatTableFilterType = 'text' | 'number' | 'date' | 'boolean' | 'set';

/** Comparison operators understood by {@link natTypedFilterFn}. */
export type NatTableFilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'isEmpty'
  | 'notEmpty';

/** Declarative per-column filter configuration attached to `meta.filter`. */
export interface NatTableColumnFilterConfig {
  type: NatTableFilterType;
  /** Operators offered; defaults are derived from the type by companion UI. */
  operators?: readonly NatTableFilterOperator[];
  /** For `'set'`: candidate values, or a resolver from the current rows. */
  options?: readonly unknown[] | ((rows: readonly unknown[]) => readonly unknown[]);
}

/**
 * Standardized value stored in `columnFilters` for a typed column. `between`
 * uses a `[from, to]` tuple where either bound may be `null` (open-ended);
 * `in` uses an array.
 */
export interface NatTableColumnFilterValue {
  operator: NatTableFilterOperator;
  value: unknown;
}

function isFilterValue(value: unknown): value is NatTableColumnFilterValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { operator?: unknown }).operator === 'string'
  );
}

const asText = (value: unknown): string => (value == null ? '' : String(value));
const asLower = (value: unknown): string => asText(value).toLowerCase();

/** Number when finite, else a parsed timestamp — lets one comparator serve numbers and dates. */
function toComparable(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const text = asText(value).trim();

  // Blank cells are not comparable; mapping them to 0 (Number('') === 0) would let
  // them match numeric ranges that include zero. NaN excludes them from every comparison.
  if (text === '') {
    return NaN;
  }

  const numeric = Number(text);

  return Number.isFinite(numeric) ? numeric : new Date(text).getTime();
}

function matchesTypedFilter(
  cell: unknown,
  operator: NatTableFilterOperator,
  value: unknown,
): boolean {
  switch (operator) {
    case 'isEmpty':
      return cell == null || cell === '';
    case 'notEmpty':
      return !(cell == null || cell === '');
    case 'equals':
      return asLower(cell) === asLower(value);
    case 'notEquals':
      return asLower(cell) !== asLower(value);
    case 'contains':
      return asLower(cell).includes(asLower(value));
    case 'startsWith':
      return asLower(cell).startsWith(asLower(value));
    case 'endsWith':
      return asLower(cell).endsWith(asLower(value));
    case 'gt':
      return toComparable(cell) > toComparable(value);
    case 'gte':
      return toComparable(cell) >= toComparable(value);
    case 'lt':
      return toComparable(cell) < toComparable(value);
    case 'lte':
      return toComparable(cell) <= toComparable(value);
    case 'between': {
      const [from, to] = Array.isArray(value) ? value : [null, null];
      const comparable = toComparable(cell);

      // `between` excludes via < / >, so a non-comparable (NaN) cell would slip
      // through both guards; reject it explicitly.
      if (Number.isNaN(comparable)) {
        return false;
      }

      if (from != null && comparable < toComparable(from)) {
        return false;
      }

      if (to != null && comparable > toComparable(to)) {
        return false;
      }

      return true;
    }
    case 'in':
      return Array.isArray(value) ? value.some((entry) => asLower(entry) === asLower(cell)) : false;
    default:
      return true;
  }
}

/**
 * Generic typed filter predicate. Reads a `{ operator, value }`
 * {@link NatTableColumnFilterValue} from the column filter state and applies the
 * matching comparison. Attach it as a column's `filterFn` for columns that
 * declare `meta.filter`.
 *
 * Returns `true` (no filtering) when the filter value is not a
 * `{ operator, value }` object, so a column sharing this predicate is inert
 * until a typed filter is set. Text comparisons are case-insensitive using the
 * browser default; locale-aware collation arrives with the i18n work (spec 06).
 */
export const natTypedFilterFn: FilterFn<RowData> = (row, columnId, filterValue) => {
  if (!isFilterValue(filterValue)) {
    return true;
  }

  return matchesTypedFilter(row.getValue(columnId), filterValue.operator, filterValue.value);
};
