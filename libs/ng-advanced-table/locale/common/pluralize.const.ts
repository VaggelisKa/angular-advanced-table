/** Appends a plural `s` unless the count is exactly one. */
export const pluralize = (label: string, count: number): string => (count === 1 ? label : `${label}s`);
