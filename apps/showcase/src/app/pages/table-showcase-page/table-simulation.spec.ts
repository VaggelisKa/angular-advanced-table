import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SPARK_HISTORY_LENGTH, TableSimulation } from './table-simulation';

describe('FEATURE: TableSimulation', () => {
  let service: TableSimulation;
  const expectedInitialTick = Date.UTC(2026, 0, 2, 9, 30, 0);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TableSimulation);
    service.pause();
  });

  describe('GIVEN: a table simulation instance is created', () => {
    describe('WHEN: be created', () => {
      it('THEN: it creates the simulation instance', () => {
        expect(service).toBeTruthy();
      });
    });
  });

  describe('GIVEN: a table simulation instance is created with default dataset options', () => {
    describe('WHEN: create a dataset that matches the default size', () => {
      it('THEN: it creates the default number of rows', () => {
        expect(service.rows()).toHaveLength(service.datasetSize());
        expect(service.lastTickAt()).toBe(expectedInitialTick);
        expect(service.rows()[0].updatedAt).toBe(expectedInitialTick);
      });
    });
  });

  describe('GIVEN: a table simulation instance is created with generated market rows', () => {
    describe('WHEN: seed rows with trading metrics', () => {
      it('THEN: it adds trading metric values to seeded rows', () => {
        const firstRow = service.rows()[0];

        expect(firstRow.price).toBeGreaterThan(0);
        expect(firstRow.volume).toBeGreaterThan(0);
        expect(firstRow.symbol).toMatch(/[A-Z0-9]+/);
      });
    });
  });

  describe('GIVEN: a table simulation instance is created with generated sparkline histories', () => {
    describe('WHEN: seed every row with a full sparkline history', () => {
      it('THEN: it adds full sparkline history to each row', () => {
        const rows = service.rows();

        expect(rows[0].priceHistory).toHaveLength(SPARK_HISTORY_LENGTH);
        expect(rows[0].priceHistory[SPARK_HISTORY_LENGTH - 1]).toBeCloseTo(rows[0].price, 2);
        expect(['up', 'down', 'flat']).toContain(rows[0].sparkTrend);
      });
    });
  });

  describe('GIVEN: a table simulation instance is created with pulsed sparkline history', () => {
    describe('WHEN: cap sparkline history at the configured length after pulses', () => {
      it('THEN: it keeps sparkline history within the configured limit', () => {
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

  describe('GIVEN: a table simulation instance is created with pulsed market rows', () => {
    describe('WHEN: mutate rows when a pulse runs', () => {
      it('THEN: it changes row values during a pulse', () => {
        service.pulse();

        expect(service.lastMutationSize()).toBeGreaterThan(0);
        expect(service.totalMutations()).toBe(service.lastMutationSize());
      });
    });
  });
});
