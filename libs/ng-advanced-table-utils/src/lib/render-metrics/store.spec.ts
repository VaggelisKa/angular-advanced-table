import { NatTableRenderMetricsStore } from './store';
import type { RowRenderMeasurement, RowRenderMetric } from './types';

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

function requireMetric(metric: RowRenderMetric | undefined): RowRenderMetric {
  if (metric === undefined) {
    throw new Error('Expected a recorded metric for the row.');
  }

  return metric;
}

function requireMeasurement(measurement: RowRenderMeasurement | null): RowRenderMeasurement {
  if (measurement === null) {
    throw new Error('Expected a measurement after recording rows.');
  }

  return measurement;
}

function ignoreFrozenWrite(write: () => void): void {
  try {
    write();
  } catch {
    // Frozen objects throw in strict mode and silently ignore writes otherwise.
  }
}

describe('NatTableRenderMetricsStore', () => {
  let store: NatTableRenderMetricsStore;

  beforeEach(() => {
    store = new NatTableRenderMetricsStore();
  });

  it('starts with no measurement and no recorded metrics', () => {
    expect(store.measurement()).toBeNull();
    expect(store.rowMetric('missing')).toBeUndefined();
    expect(store.rowMetrics()).toStrictEqual({});
  });

  it('aggregates durations across rows in the same render cycle', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 2.4 });
    store.record({ rowId: 'row-2', renderToken: 1, durationMs: 6.8 });
    store.record({ rowId: 'row-3', renderToken: 1, durationMs: 12.0 });

    const measurement = store.measurement();

    expect(measurement).not.toBeNull();

    if (measurement === null) {
      throw new Error('Expected a measurement after recording rows.');
    }

    expect(measurement.rowCount).toBe(3);
    expect(measurement.durationMs).toBe(12);
    expect(measurement.averageRowDurationMs).toBeCloseTo(7.1, 1);
    expect(measurement.rowsPerSecond).toBeGreaterThan(0);
  });

  it('resets the cycle aggregate when a new render token arrives while keeping per-row history', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 2 });
    store.record({ rowId: 'row-2', renderToken: 1, durationMs: 3 });
    store.record({ rowId: 'row-3', renderToken: 2, durationMs: 10 });

    const measurement = store.measurement();

    expect(measurement).not.toBeNull();

    if (measurement === null) {
      throw new Error('Expected a measurement after recording rows.');
    }

    expect(measurement.rowCount).toBe(1);
    expect(measurement.durationMs).toBe(10);
    expect(requireMetric(store.rowMetric('row-1')).durationMs).toBe(2);
    expect(requireMetric(store.rowMetric('row-3')).tone).toBe('slow');
  });

  it('retains only the newest row metrics according to the configured row limit', () => {
    store = new NatTableRenderMetricsStore({ maxRetainedRowMetrics: 2 });

    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 2 });
    store.record({ rowId: 'row-2', renderToken: 1, durationMs: 3 });
    store.record({ rowId: 'row-1', renderToken: 2, durationMs: 4 });
    store.record({ rowId: 'row-3', renderToken: 2, durationMs: 5 });

    expect(Object.keys(store.rowMetrics())).toStrictEqual(['row-1', 'row-3']);
    expect(store.rowMetric('row-2')).toBeUndefined();
    expect(requireMetric(store.rowMetric('row-1')).durationMs).toBe(4);
    expect(store.measurement()?.rowCount).toBe(2);
  });

  it('freezes exposed metric state so external mutation cannot corrupt the store', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 4 });

    const rowMetrics = store.rowMetrics();
    const metric = requireMetric(store.rowMetric('row-1'));
    const measurement = requireMeasurement(store.measurement());

    expect(Object.isFrozen(rowMetrics)).toBe(true);
    expect(Object.isFrozen(metric)).toBe(true);
    expect(Object.isFrozen(measurement)).toBe(true);

    ignoreFrozenWrite(() => {
      (rowMetrics as Record<string, RowRenderMetric>)['row-2'] = {
        durationMs: 99,
        measuredAt: 0,
        tone: 'slow'
      };
    });

    ignoreFrozenWrite(() => {
      (metric as Mutable<RowRenderMetric>).durationMs = 99;
    });

    ignoreFrozenWrite(() => {
      (measurement as Mutable<RowRenderMeasurement>).durationMs = 99;
    });

    expect(store.rowMetric('row-2')).toBeUndefined();
    expect(requireMetric(store.rowMetric('row-1')).durationMs).toBe(4);
    expect(store.measurement()?.durationMs).toBe(4);
  });

  it('classifies durations into render tones', () => {
    store.record({ rowId: 'fast', renderToken: 1, durationMs: 1.2 });
    store.record({ rowId: 'watch', renderToken: 1, durationMs: 6 });
    store.record({ rowId: 'slow', renderToken: 1, durationMs: 15 });

    expect(requireMetric(store.rowMetric('fast')).tone).toBe('fast');
    expect(requireMetric(store.rowMetric('watch')).tone).toBe('watch');
    expect(requireMetric(store.rowMetric('slow')).tone).toBe('slow');
  });

  it('clears all state on reset', () => {
    store.record({ rowId: 'row-1', renderToken: 1, durationMs: 4 });
    store.reset();

    expect(store.measurement()).toBeNull();
    expect(store.rowMetric('row-1')).toBeUndefined();
  });
});
