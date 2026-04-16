import { NatTableRenderMetricsStore } from './store';

describe('NatTableRenderMetricsStore', () => {
  let store: NatTableRenderMetricsStore;

  beforeEach(() => {
    store = new NatTableRenderMetricsStore();
  });

  it('starts with no measurement and no recorded metrics', () => {
    expect(store.measurement()).toBeNull();
    expect(store.rowMetric('missing')).toBeUndefined();
    expect(store.rowMetrics()).toEqual({});
  });

  it('aggregates durations across rows in the same render cycle', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 2.4 });
    store.record({ rowId: 'row-2', renderToken: 1, durationMs: 6.8 });
    store.record({ rowId: 'row-3', renderToken: 1, durationMs: 12.0 });

    const measurement = store.measurement();

    expect(measurement).not.toBeNull();
    expect(measurement!.rowCount).toBe(3);
    expect(measurement!.durationMs).toBe(12);
    expect(measurement!.averageRowDurationMs).toBeCloseTo(7.1, 1);
    expect(measurement!.rowsPerSecond).toBeGreaterThan(0);
  });

  it('resets the cycle aggregate when a new render token arrives while keeping per-row history', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 2 });
    store.record({ rowId: 'row-2', renderToken: 1, durationMs: 3 });
    store.record({ rowId: 'row-3', renderToken: 2, durationMs: 10 });

    const measurement = store.measurement();

    expect(measurement!.rowCount).toBe(1);
    expect(measurement!.durationMs).toBe(10);
    expect(store.rowMetric('row-1')?.durationMs).toBe(2);
    expect(store.rowMetric('row-3')?.tone).toBe('slow');
  });

  it('classifies durations into render tones', () => {
    store.record({ rowId: 'fast', renderToken: 1, durationMs: 1.2 });
    store.record({ rowId: 'watch', renderToken: 1, durationMs: 6 });
    store.record({ rowId: 'slow', renderToken: 1, durationMs: 15 });

    expect(store.rowMetric('fast')?.tone).toBe('fast');
    expect(store.rowMetric('watch')?.tone).toBe('watch');
    expect(store.rowMetric('slow')?.tone).toBe('slow');
  });

  it('clears all state on reset', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 4 });
    store.reset();

    expect(store.measurement()).toBeNull();
    expect(store.rowMetric('row-1')).toBeUndefined();
  });
});
