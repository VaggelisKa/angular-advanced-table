/*
 * Shared predicates for the three domain completeness specs. Each spec walks a
 * different dictionary shape but asks the same two questions of every entry:
 * is the copy there, and does the formatter produce something a screen reader
 * can read out.
 */

type NumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;

/** Narrows an optional dictionary slice, failing the spec with the key path when it is absent. */
export const expectDefined = <TValue>(value: TValue | undefined, label: string): TValue => {
  if (value === undefined) {
    throw new Error(`${label} must be defined.`);
  }

  return value;
};

export const isNonEmptyText = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0;

export const producesText = <TContext>(formatter: ((context: TContext) => string) | undefined, context: TContext): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(context));

/* A fractional value under the locale's own id, so a formatter that ignores either argument shows up. */
export const formatsNumber = (formatter: NumberFormatter | undefined, localeId: string): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(1234.5, { maximumFractionDigits: 1 }, localeId));
