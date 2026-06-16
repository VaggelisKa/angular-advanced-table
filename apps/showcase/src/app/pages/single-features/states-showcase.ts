import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NAT_TABLE_DATA_STATUS,
  NatTable,
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
} from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

import type { ColumnDef } from '@tanstack/angular-table';
import type { NatTableAccessibilityText, NatTableDataStatus } from 'ng-advanced-table';

interface IncidentRow {
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly loadingRows: IncidentRow[] = [];
  readonly emptyRows: IncidentRow[] = [];
  readonly errorRows: IncidentRow[] = [];
  readonly successRows = DEMO_DATA;
  readonly errorStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.error);
  readonly error = signal<unknown>(new Error('Incident service returned 503.'));
  readonly transitionPreviewState = signal<TransitionPreviewState>('loading');
  readonly transitionPreviewError = new Error('Transition service returned 503.');
  readonly transitionPreviewRows = computed(() =>
    this.transitionPreviewState() === 'rows' ? DEMO_DATA : [],
  );
  readonly transitionPreviewDataStatus = computed<NatTableDataStatus>(() => {
    const state = this.transitionPreviewState();

    if (state === 'loading') {
      return NAT_TABLE_DATA_STATUS.loading;
    }

    if (state === 'error') {
      return NAT_TABLE_DATA_STATUS.error;
    }

    return NAT_TABLE_DATA_STATUS.success;
  });
  readonly transitionPreviewOptions: readonly {
    state: TransitionPreviewState;
    label: string;
  }[] = [
    { state: 'loading', label: 'Loading' },
    { state: 'empty', label: 'Empty' },
    { state: 'error', label: 'Error' },
    { state: 'rows', label: 'Rows' },
  ];

  readonly columns: ColumnDef<IncidentRow, unknown>[] = [
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

  readonly loadingTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Loading incidents.',
  };
  readonly emptyTableAccessibilityCopy: NatTableAccessibilityText = {
    emptyState: 'No incidents found.',
  };
  readonly errorTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Retrying incident queue.',
    errorState: 'Incident queue unavailable.',
  };
  readonly refreshTableAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Refreshing incidents.',
  };
  readonly transitionPreviewAccessibilityCopy: NatTableAccessibilityText = {
    loadingState: 'Loading transition preview.',
    emptyState: 'No transition preview rows.',
    errorState: 'Transition request failed.',
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.retryTimeoutId !== null) {
        clearTimeout(this.retryTimeoutId);
      }
    });
  }

  retryErrorExample(): void {
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

  showTransitionPreviewState(state: TransitionPreviewState): void {
    this.transitionPreviewState.set(state);
  }

  isTransitionPreviewState(state: TransitionPreviewState): boolean {
    return this.transitionPreviewState() === state;
  }

  formatError(error: unknown): string {
    return error instanceof Error ? error.message : 'The request failed.';
  }
}
