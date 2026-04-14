import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Table } from './table';

interface Row {
  id: string;
  workload: string;
  region: string;
  owner: string;
  status: 'Healthy' | 'Pending' | 'Alert' | 'Offline';
  latencyMs: number;
  throughput: number;
  errorRate: number;
  saturation: number;
  updatedAt: number;
}

@Component({
  imports: [Table],
  template: `
    <app-table
      [rows]="rows()"
      [statusCounts]="statusCounts"
      [lastCycleDurationMs]="12.4"
      [lastTickAt]="lastTickAt"
    />
  `,
})
class TableHost {
  protected readonly rows = signal<Row[]>(buildRows(36));
  protected readonly statusCounts = {
    Healthy: 9,
    Pending: 9,
    Alert: 9,
    Offline: 9,
  };
  protected readonly lastTickAt = Date.now();
}

describe('Table', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
  });

  it('should render the default page size', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(24);
  });

  it('should filter rows by the search query', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#table-search') as HTMLInputElement;
    searchInput.value = 'svc-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstRow = rows[0] as HTMLTableRowElement;

    expect(rows.length).toBe(1);
    expect(firstRow.textContent).toContain('Checkout 1');
  });
});

function buildRows(size: number): Row[] {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert', 'Offline'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    workload: `Checkout ${index + 1}`,
    region: 'us-east-1',
    owner: 'Core Platform',
    status: statuses[index % statuses.length],
    latencyMs: 50 + index,
    throughput: 1000 + index,
    errorRate: 0.01,
    saturation: 40,
    updatedAt: Date.now(),
  }));
}
