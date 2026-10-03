import { resolveListFieldWidth } from './list-flow-layout.util';

describe('FEATURE: List flow layout field widths', () => {
  describe('GIVEN: a column id that is a valid CSS identifier', () => {
    describe('WHEN: the field width value is resolved', () => {
      it('THEN: it reads the per-column token and falls back to an equal split of the visible fields', () => {
        expect(resolveListFieldWidth('total', 4)).toBe('var(--nat-list-field-width-total, calc(100% / 4))');
      });
    });
  });

  describe('GIVEN: a column id with characters that are not ident-safe', () => {
    describe('WHEN: the field width value is resolved', () => {
      it('THEN: it escapes them so the token name stays valid', () => {
        expect(resolveListFieldWidth('customer.name', 2)).toBe('var(--nat-list-field-width-customer\\.name, calc(100% / 2))');
        expect(resolveListFieldWidth('a b', 2)).toBe('var(--nat-list-field-width-a\\ b, calc(100% / 2))');
      });
    });
  });

  describe('GIVEN: no visible fields', () => {
    describe('WHEN: the field width value is resolved', () => {
      it('THEN: it never divides by zero', () => {
        expect(resolveListFieldWidth('x', 0)).toBe('var(--nat-list-field-width-x, calc(100% / 1))');
      });
    });
  });
});
