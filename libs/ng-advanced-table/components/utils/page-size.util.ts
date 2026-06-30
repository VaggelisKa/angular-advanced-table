export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const sanitizePageSizeOptions = (options: readonly number[]): number[] => {
  const sanitized = options.map((value) => Math.trunc(value)).filter((value) => value > 0);

  return sanitized.length ? sanitized : [...DEFAULT_PAGE_SIZE_OPTIONS];
};
