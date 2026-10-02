/**
 * Escapes a column id for use inside a CSS custom property name, so an id such
 * as `customer.name` becomes `customer\.name` (the consumer writes the same
 * escaped form in their stylesheet). Ident-safe characters pass through.
 */
const escapeCssIdent = (value: string): string => value.replaceAll(/[^\w-]/gu, (char) => `\\${char}`);

/**
 * The inline value written to a field's `--sys-nat-table-list-field-width`
 * bridge in the `flow` item layout: the consumer's
 * `--nat-list-field-width-<column-id>` token when set, else an equal split of
 * the line between the visible fields. The CSS rule reads it as `flex-basis`.
 * The default is per field, not per line: CSS cannot tell which other tokens
 * are set, so consumers set a token for every visible column once they set
 * one (the same rule as `--nat-list-item-areas`); the docs say so.
 */
export const resolveListFieldWidth = (columnId: string, visibleFieldCount: number): string =>
  `var(--nat-list-field-width-${escapeCssIdent(columnId)}, calc(100% / ${String(Math.max(visibleFieldCount, 1))}))`;
