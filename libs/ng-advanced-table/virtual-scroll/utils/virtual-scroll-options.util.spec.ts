import { describeVirtualScrollOptionProblems, normalizeVirtualScrollOptions } from './virtual-scroll-options.util';

describe('FEATURE: virtual-scroll options', () => {
  describe('GIVEN: normalizeVirtualScrollOptions', () => {
    describe('WHEN: only rowHeight is provided', () => {
      it('THEN: it applies the CDK fixed-size buffer defaults', () => {
        expect(normalizeVirtualScrollOptions({ rowHeight: 44 })).toStrictEqual({ rowHeight: 44, minBufferPx: 100, maxBufferPx: 200 });
      });
    });

    describe('WHEN: rowHeight is invalid', () => {
      it('THEN: it falls back to the documented default height', () => {
        expect(normalizeVirtualScrollOptions({ rowHeight: Number.NaN }).rowHeight).toBe(48);
        expect(normalizeVirtualScrollOptions({ rowHeight: 0 }).rowHeight).toBe(48);
        expect(normalizeVirtualScrollOptions({ rowHeight: -12 }).rowHeight).toBe(48);
      });
    });

    describe('WHEN: the buffers are inverted', () => {
      it('THEN: it raises maxBufferPx to minBufferPx so the CDK strategy never throws', () => {
        expect(normalizeVirtualScrollOptions({ rowHeight: 40, minBufferPx: 300, maxBufferPx: 120 })).toStrictEqual({
          rowHeight: 40,
          minBufferPx: 300,
          maxBufferPx: 300
        });
      });
    });

    describe('WHEN: a buffer is negative or non-finite', () => {
      it('THEN: it falls back to the CDK default for that buffer', () => {
        expect(normalizeVirtualScrollOptions({ rowHeight: 40, minBufferPx: -5 }).minBufferPx).toBe(100);
        expect(normalizeVirtualScrollOptions({ rowHeight: 40, maxBufferPx: Number.POSITIVE_INFINITY }).maxBufferPx).toBe(200);
      });
    });
  });

  describe('GIVEN: describeVirtualScrollOptionProblems', () => {
    describe('WHEN: the options are valid', () => {
      it('THEN: it reports no problems', () => {
        expect(describeVirtualScrollOptionProblems({ rowHeight: 40, minBufferPx: 50, maxBufferPx: 90 })).toStrictEqual([]);
      });
    });

    describe('WHEN: several options are broken at once', () => {
      it('THEN: it reports one problem per broken option', () => {
        const problems = describeVirtualScrollOptionProblems({ rowHeight: -1, minBufferPx: Number.NaN, maxBufferPx: -3 });

        expect(problems).toHaveLength(3);
        expect(problems[0]).toContain('rowHeight');
        expect(problems[1]).toContain('minBufferPx');
        expect(problems[2]).toContain('maxBufferPx');
      });
    });

    describe('WHEN: the buffers are inverted', () => {
      it('THEN: it explains that the larger buffer wins', () => {
        expect(describeVirtualScrollOptionProblems({ rowHeight: 40, minBufferPx: 200, maxBufferPx: 100 })).toStrictEqual([
          'maxBufferPx must be at least minBufferPx; the larger of the two is used.'
        ]);
      });
    });
  });
});
