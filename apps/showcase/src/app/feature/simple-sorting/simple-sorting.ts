import { Component } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderRows, preconfiguredTableState } from './simple-sorting.const';
import { mockOrderColumns } from '../../ui';

@Component({
  selector: 'app-simple-sorting',
  imports: [NatTable, NatTableSurface],
  templateUrl: './simple-sorting.html',
  styleUrl: './simple-sorting.css'
})
export class SimpleSorting {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly tableState = preconfiguredTableState;
}
