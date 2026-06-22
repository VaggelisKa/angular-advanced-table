import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import type { ColumnDef } from '@tanstack/angular-table';

import {
  NAT_TABLE_DATA_STATUS,
  NatTable,
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
} from 'ng-advanced-table';
import type { NatTableAccessibilityText, NatTableDataStatus } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

import { formatError } from './states-showcase.util';


type IncidentRow = {
  id: string;
  service: string;
  owner: string;
  severity: string;
}

type TransitionPreviewState = 'loading' | 'empty' | 'error' | 'rows';

const DEMO_DATA: IncidentRow[] = [
  { id: 'INC-1042', service: 'Checkout API', owner: 'Payments', severity: 'High' },
  { id: 'INC-1043', service: 'Search index', owner: 'Discovery', severity: 'Medium' },
  { id: 'INC-1044', service: 'Notification worker', owner: 'Messaging', severity: 'Low' },
];
const ERROR_RETRY_DELAY_MS = 900;

@Component({
  selector: 'app-states-showcase',
  imports: [
    NatTable,
    NatTableSurface,
    NatTableLoadingTemplate,
    NatTableEmptyTemplate,
    NatTableErrorTemplate,
  ],
  templateUrl: './states-showcase.html',
  styleUrl: './states-showcase.css',
})
export class StatesShowcasePage {
  private readonly destroyRef = inject(DestroyRef);
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  protected readonly loadingRows: IncidentRow[] = [];
  protected readonly emptyRows: IncidentRow[] = [];
  protected readonly errorRows: IncidentRow[] = [];
  protected readonly successRows = DEMO_DATA;
  protected readonly errorStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.error);
  protected readonly error = signal<unknown>(new Error('Incident service returned 503.'));
  private readonly transitionPreviewState = signal<TransitionPreviewState>('loading');
  protected readonly transitionPreviewError = new Error('Transition service returned 503.');
  protected readonly transitionPreviewRows = computed(() =>
    this.transitionPreviewState() === 'rows' ? DEMO_DATA : [],
  );

  protected readonly transitionPreviewDataStatus = computed<NatTableDataStatus>(() => {
    const state = this.transitionPreviewState();

    if (state === 'loading') {
      return NAT_TABLE_DATA_STATUS.loading;
    }

    if (state === 'error') {
      return NAT_TABLE_DATA_STATUS.error;
    }

    return NAT_TABLE_DATA_STATUS.success;
  });

  protected readonly transitionPreviewOptions: readonly {
    state: TransitionPreviewState;
    label: string;
  }[] = [
    { state: 'loading', label: 'Loading' },
    { state: 'empty', label: 'Empty' },
    { state: 'error', label: 'Error' },
    { state: 'rows', label: 'Rows' },
  ];

  protected readonly columns: ColumnDef<IncidentRow, unknown>[] = [
    {
      accessorKey: 'id',
      header: 'Incident',
      meta: { label: 'Incident', rowHeader: true },
    },
    {
      accessorKey: 'service',
      header: 'Service',
      meta: { label: 'Service' },
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      meta: { label: 'Owner' },
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      meta: { label: 'Severity' },
    },
  ];

  protected readonly loadingTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Loading incidents.',
  };

  protected readonly emptyTableAccessibilityCopy: NatTableAccessibilityText = {
    emptyState: 'No incidents found.',
  };

  protected readonly errorTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Retrying incident queue.',
    errorState: 'Incident queue unavailable.',
  };

  protected readonly refreshTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Refreshing incidents.',
  };

  protected readonly transitionPreviewAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Loading transition preview.',
    emptyState: 'No transition preview rows.',
    errorState: 'Transition request failed.',
  };

  public constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.retryTimeoutId !== null) {
        clearTimeout(this.retryTimeoutId);
      }
    });
  }

  protected retryErrorExample(): void {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
    }

    this.errorStatus.set(NAT_TABLE_DATA_STATUS.loading);
    this.retryTimeoutId = setTimeout(() => {
      this.error.set(new Error('Incident service returned 503 after retry.'));
      this.errorStatus.set(NAT_TABLE_DATA_STATUS.error);
      this.retryTimeoutId = null;
    }, ERROR_RETRY_DELAY_MS);
  }

  protected showTransitionPreviewState(state: TransitionPreviewState): void {
    this.transitionPreviewState.set(state);
  }

  protected isTransitionPreviewState(state: TransitionPreviewState): boolean {
    return this.transitionPreviewState() === state;
  }

  protected readonly formatError = formatError;
}
