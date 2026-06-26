import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SPARK_HISTORY_LENGTH, TableSimulation } from './table-simulation';

describe('FEATURE: TableSimulation', () => {
  let service: TableSimulation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TableSimulation);
    service.pause();
  });

  describe('GIVEN: be created', () => {
    describe('WHEN: be created', () => {
      it('THEN: it should be created', () => {
        expect(service).toBeTruthy();
      });
    });
  });

  describe('GIVEN: create a dataset that matches the default size', () => {
    describe('WHEN: create a dataset that matches the default size', () => {
      it('THEN: it should create a dataset that matches the default size', () => {
        expect(service.rows()).toHaveLength(service.datasetSize());
      });
    });
  });

  describe('GIVEN: seed rows with trading metrics', () => {
    describe('WHEN: seed rows with trading metrics', () => {
      it('THEN: it should seed rows with trading metrics', () => {
        const firstRow = service.rows()[0];

        expect(firstRow.price).toBeGreaterThan(0);
        expect(firstRow.volume).toBeGreaterThan(0);
        expect(firstRow.symbol).toMatch(/[A-Z0-9]+/);
      });
    });
  });

  describe('GIVEN: seed every row with a full sparkline history', () => {
    describe('WHEN: seed every row with a full sparkline history', () => {
      it('THEN: it should seed every row with a full sparkline history', () => {
        const rows = service.rows();

        expect(rows[0].priceHistory).toHaveLength(SPARK_HISTORY_LENGTH);
        expect(rows[0].priceHistory[SPARK_HISTORY_LENGTH - 1]).toBeCloseTo(rows[0].price, 2);
        expect(['up', 'down', 'flat']).toContain(rows[0].sparkTrend);
      });
    });
  });

  describe('GIVEN: cap sparkline history at the configured length after pulses', () => {
    describe('WHEN: cap sparkline history at the configured length after pulses', () => {
      it('THEN: it should cap sparkline history at the configured length after pulses', () => {
        for (let index = 0; index < 3; index += 1) {
          service.pulse();
        }

        const row = service.rows().find((candidate) => candidate.priceHistory.length > 0);

        if (!row) {
          throw new Error('Expected at least one row with sparkline history.');
        }

        expect(row.priceHistory.length).toBeLessThanOrEqual(SPARK_HISTORY_LENGTH);
      });
    });
  });

  describe('GIVEN: mutate rows when a pulse runs', () => {
    describe('WHEN: mutate rows when a pulse runs', () => {
      it('THEN: it should mutate rows when a pulse runs', () => {
        service.pulse();

        expect(service.lastMutationSize()).toBeGreaterThan(0);
        expect(service.totalMutations()).toBe(service.lastMutationSize());
      });
    });
  });
});
