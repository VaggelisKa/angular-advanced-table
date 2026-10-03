import type { RowData, SortingFn } from '@tanstack/angular-table';
import { reSplitAlphaNumeric, sortingFns } from '@tanstack/angular-table';

/**
 * One alphanumeric chunk: its `parseInt` value for a run of digits, the raw
 * text otherwise. TanStack only compares the number of a digit run and the
 * text of anything else, so one primitive per chunk carries the whole key.
 */
type AlphanumericChunk = string | number;

/** Key builder plus key comparator reproducing one built-in TanStack sorting function. */
type KeyedSortingFn = {
  readonly toKey: (value: unknown) => unknown;
  readonly compare: (a: unknown, b: unknown) => number;
};

// Mirrors TanStack's private `toString` in sortingFns.ts.
const toSortString = (value: unknown): string => {
  if (typeof value === 'number') {
    return Number.isNaN(value) || value === Infinity || value === -Infinity ? '' : String(value);
  }

  return typeof value === 'string' ? value : '';
};

const compareBasic = (a: unknown, b: unknown): number => {
  if (a === b) {
    return 0;
  }

  return (a as number) > (b as number) ? 1 : -1;
};

const compareDatetime = (a: unknown, b: unknown): number => {
  if ((a as number) > (b as number)) {
    return 1;
  }

  return (a as number) < (b as number) ? -1 : 0;
};

const toAlphanumericChunks = (value: string): readonly AlphanumericChunk[] =>
  value
    .split(reSplitAlphaNumeric)
    .filter(Boolean)
    .map((text) => {
      const number = Number.parseInt(text, 10);

      return Number.isNaN(number) ? text : number;
    });

const compareText = (a: string, b: string): number => {
  if (a > b) return 1;

  return b > a ? -1 : 0;
};

const compareAlphanumericChunk = (a: AlphanumericChunk, b: AlphanumericChunk): number => {
  const aIsText = typeof a === 'string';
  const bIsText = typeof b === 'string';

  if (aIsText && bIsText) {
    return compareText(a, b);
  }

  // One is text, one is a number: text sorts first (as in TanStack).
  if (aIsText || bIsText) {
    return aIsText ? -1 : 1;
  }

  return compareBasic(a, b);
};

// Same result as TanStack's `compareAlphanumeric`, over chunks split once per row.
const compareAlphanumericChunks = (a: unknown, b: unknown): number => {
  const aChunks = a as readonly AlphanumericChunk[];
  const bChunks = b as readonly AlphanumericChunk[];
  const length = Math.min(aChunks.length, bChunks.length);

  for (let index = 0; index < length; index++) {
    const result = compareAlphanumericChunk(aChunks[index], bChunks[index]);

    if (result !== 0) {
      return result;
    }
  }

  return aChunks.length - bChunks.length;
};

const toValue = (value: unknown): unknown => value;
// Relational comparison reads a plain Date through `valueOf()`, so its time
// compares the same; subclasses keep the object, since they may override it.
const toTime = (value: unknown): unknown =>
  value instanceof Date && Object.getPrototypeOf(value) === Date.prototype ? value.getTime() : value;
const toLowerText = (value: unknown): string => toSortString(value).toLowerCase();
const toLowerChunks = (value: unknown): readonly AlphanumericChunk[] => toAlphanumericChunks(toLowerText(value));
const toChunks = (value: unknown): readonly AlphanumericChunk[] => toAlphanumericChunks(toSortString(value));

const KEYED_SORTING_FNS = new Map<SortingFn<RowData>, KeyedSortingFn>([
  [sortingFns.basic, { toKey: toValue, compare: compareBasic }],
  [sortingFns.datetime, { toKey: toTime, compare: compareDatetime }],
  [sortingFns.text, { toKey: toLowerText, compare: compareBasic }],
  [sortingFns.textCaseSensitive, { toKey: toSortString, compare: compareBasic }],
  [sortingFns.alphanumeric, { toKey: toLowerChunks, compare: compareAlphanumericChunks }],
  [sortingFns.alphanumericCaseSensitive, { toKey: toChunks, compare: compareAlphanumericChunks }]
]);

/**
 * Key-based equivalent of a built-in TanStack sorting function, or `null` for
 * any other (consumer) sorting function. Comparing derived keys gives the same
 * order as the built-in, but reads and tokenizes each value once per sort
 * instead of on every comparison.
 */
export const resolveKeyedSortingFn = <TData extends RowData>(sortingFn: SortingFn<TData>): KeyedSortingFn | null =>
  KEYED_SORTING_FNS.get(sortingFn as SortingFn<RowData>) ?? null;
