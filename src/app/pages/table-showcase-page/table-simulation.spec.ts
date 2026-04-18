import { TestBed } from '@angular/core/testing';

import { SPARK_HISTORY_LENGTH, TableSimulation } from './table-simulation';

describe('TableSimulation', () => {
  let service: TableSimulation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableSimulation);
    service.pause();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a dataset that matches the default size', () => {
    expect(service.rows().length).toBe(service.datasetSize());
  });

  it('should seed rows with trading metrics', () => {
    const firstRow = service.rows()[0];

    expect(firstRow.price).toBeGreaterThan(0);
    expect(firstRow.volume).toBeGreaterThan(0);
    expect(firstRow.symbol).toMatch(/[A-Z0-9]+/);
  });

  it('should seed every row with a full sparkline history', () => {
    const rows = service.rows();

    expect(rows[0].priceHistory.length).toBe(SPARK_HISTORY_LENGTH);
    expect(rows[0].priceHistory[SPARK_HISTORY_LENGTH - 1]).toBeCloseTo(rows[0].price, 2);
    expect(['up', 'down', 'flat']).toContain(rows[0].sparkTrend);
  });

  it('should cap sparkline history at the configured length after pulses', () => {
    for (let index = 0; index < 3; index += 1) {
      service.pulse();
    }

    const row = service.rows().find((candidate) => candidate.priceHistory.length > 0);

    expect(row).toBeDefined();
    expect(row!.priceHistory.length).toBeLessThanOrEqual(SPARK_HISTORY_LENGTH);
  });

  it('should mutate rows when a pulse runs', () => {
    service.pulse();

    expect(service.lastMutationSize()).toBeGreaterThan(0);
    expect(service.totalMutations()).toBe(service.lastMutationSize());
  });
});
