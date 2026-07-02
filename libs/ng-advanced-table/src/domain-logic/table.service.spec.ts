import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { RowData, Table } from '@tanstack/angular-table';

import { NatTableService } from './table.service';
import type { NatTableUiController } from '../common/ui-controller.type';

const createController = (id: string): NatTableUiController => {
  return {
    table: {} as Table<RowData>,
    enableGlobalFilter: () => false,
    enablePagination: () => false,
    patchState: () => undefined,
    tableElementId: signal(id)
  };
};

describe('NatTableService', () => {
  let service: NatTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NatTableService]
    });

    service = TestBed.inject(NatTableService);
  });

  it('clears the active controller only when the same instance unregisters', () => {
    const first = createController('first-table');
    const second = createController('second-table');

    service.setController(first);
    service.clearController(second);

    expect(service.controller()).toBe(first);

    service.setController(second);
    service.clearController(first);

    expect(service.controller()).toBe(second);

    service.clearController(second);

    expect(service.controller()).toBeNull();
  });
});
