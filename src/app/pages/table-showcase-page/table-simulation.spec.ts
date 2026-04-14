import { TestBed } from '@angular/core/testing';

import { TableSimulation } from './table-simulation';

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

  it('should mutate rows when a pulse runs', () => {
    service.pulse();

    expect(service.lastMutationSize()).toBeGreaterThan(0);
    expect(service.totalMutations()).toBe(service.lastMutationSize());
  });
});
