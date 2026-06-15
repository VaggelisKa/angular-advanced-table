import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import {
  NAT_TABLE_DATA_STATUS,
  NatTable,
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
  type NatTableAccessibilityText,
  type NatTableDataStatus,
} from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

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
  template: `
    <div class="showcase-page showcase-container table-states-page">
      <header class="header-section">
        <h1 class="title">Table States</h1>
        <p class="description">
          Loading, empty, and error rows stay inside the table body while callers provide the
          lifecycle and custom UI.
        </p>
      </header>

      <div class="grid-layout state-grid">
        <div class="card">
          <h2 class="card-title">Loading state</h2>
          <nat-table-surface [accessibilityText]="loadingTableAccessibilityCopy">
            <nat-table
              [data]="loadingRows"
              [columns]="columns"
              dataStatus="loading"
              accessibleName="Loading incidents table"
            >
              <ng-template natTableLoading>
                <div class="state-template">
                  <strong>Loading incidents</strong>
                  <span>Fetching the latest incident queue.</span>
                  <span class="state-skeleton" aria-hidden="true"></span>
                </div>
              </ng-template>
            </nat-table>
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Empty state</h2>
          <nat-table-surface [accessibilityText]="emptyTableAccessibilityCopy">
            <nat-table
              [data]="emptyRows"
              [columns]="columns"
              accessibleName="Empty incidents table"
            >
              <ng-template natTableEmpty let-filtered="filtered">
                <div class="state-template">
                  <strong>No incidents found</strong>
                  <span>{{
                    filtered ? 'No rows match the active filters.' : 'The queue is clear.'
                  }}</span>
                </div>
              </ng-template>
            </nat-table>
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Error state</h2>
          <nat-table-surface [accessibilityText]="errorTableAccessibilityCopy">
            <nat-table
              [data]="errorRows"
              [columns]="columns"
              [dataStatus]="errorStatus()"
              [error]="error()"
              accessibleName="Errored incidents table"
            >
              <ng-template natTableError let-error>
                <div class="state-template state-template-error">
                  <strong>Incident queue unavailable</strong>
                  <span>{{ formatError(error) }}</span>
                  <button type="button" class="btn btn-outline" (click)="retryErrorExample()">
                    Retry
                  </button>
                </div>
              </ng-template>

              <ng-template natTableLoading>
                <div class="state-template">
                  <strong>Retrying incident queue</strong>
                  <span>Keeping the retry action in the container.</span>
                </div>
              </ng-template>
            </nat-table>
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Transition preview</h2>
          <div class="transition-controls">
            <div class="btn-group" aria-label="Preview table state">
              @for (option of transitionPreviewOptions; track option.state) {
                <button
                  type="button"
                  class="btn-sm"
                  [class.active]="isTransitionPreviewState(option.state)"
                  [attr.aria-pressed]="isTransitionPreviewState(option.state)"
                  (click)="showTransitionPreviewState(option.state)"
                >
                  {{ option.label }}
                </button>
              }
            </div>
          </div>
          <nat-table-surface
            class="transition-preview-surface"
            [accessibilityText]="transitionPreviewAccessibilityCopy"
          >
            <nat-table
              [data]="transitionPreviewRows()"
              [columns]="columns"
              [dataStatus]="transitionPreviewDataStatus()"
              [error]="transitionPreviewError"
              accessibleName="State transition preview table"
            >
              <ng-template natTableLoading>
                <div class="state-template">
                  <strong>Loading queue</strong>
                  <span>Preparing the next incident view.</span>
                  <span class="state-skeleton" aria-hidden="true"></span>
                </div>
              </ng-template>

              <ng-template natTableEmpty>
                <div class="state-template">
                  <strong>No transition rows</strong>
                  <span>The selected view has no incidents.</span>
                </div>
              </ng-template>

              <ng-template natTableError let-error>
                <div class="state-template state-template-error">
                  <strong>Transition request failed</strong>
                  <span>{{ formatError(error) }}</span>
                </div>
              </ng-template>
            </nat-table>
          </nat-table-surface>
        </div>

        <div class="card state-reference-card">
          <h2 class="card-title">Background refresh</h2>
          <nat-table-surface [accessibilityText]="refreshTableAccessibilityCopy">
            <nat-table
              [data]="successRows"
              [columns]="columns"
              dataStatus="loading"
              accessibleName="Refreshing incidents table"
            />
          </nat-table-surface>
        </div>
      </div>
    </div>
  `,
  styles: `
    .state-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .state-template {
      display: grid;
      justify-items: center;
      gap: 6px;
      width: min(360px, 100%);
      margin: 0 auto;
      color: var(--showcase-page-text);
      line-height: 1.45;
    }

    .state-template strong {
      font-size: 0.95rem;
      font-weight: 650;
    }

    .state-template span {
      color: var(--showcase-page-text-soft);
      font-size: 0.82rem;
    }

    .state-template-error span {
      color: var(--showcase-page-negative);
    }

    .transition-controls {
      display: flex;
      padding: 14px 20px;
      border-bottom: 1px solid var(--showcase-page-border);
    }

    .transition-preview-surface {
      --nat-table-state-transition-duration: 320ms;
      --nat-table-state-transition-distance: 8px;
      --nat-table-state-transition-opacity-from: 0.08;
    }

    .state-skeleton {
      display: block;
      width: min(240px, 80%);
      height: 8px;
      margin-top: 6px;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        var(--showcase-page-surface-muted),
        var(--showcase-page-border-strong),
        var(--showcase-page-surface-muted)
      );
    }

    .state-reference-card {
      grid-column: 1 / -1;
    }

    @media (max-width: 900px) {
      .state-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
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
