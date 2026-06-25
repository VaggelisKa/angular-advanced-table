import { DEFAULT_PAGE_SIZE_OPTIONS, sanitizePageSizeOptions } from './table-ui.helpers';

describe('table UI helpers', () => {
  it('dedupes valid page-size options after normalization while preserving first-occurrence order', () => {
    expect(sanitizePageSizeOptions([25, 10, 25.9, 50, 10.1, 2.9])).toStrictEqual([25, 10, 50, 2]);
  });

  it('falls back to the default page-size options when every candidate is invalid', () => {
    expect(sanitizePageSizeOptions([0, -5, Number.NaN])).toStrictEqual([...DEFAULT_PAGE_SIZE_OPTIONS]);
  });
});
