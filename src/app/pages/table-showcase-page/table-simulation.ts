import { computed, effect, Injectable, signal } from '@angular/core';

export type SimulationStatus = 'Healthy' | 'Pending' | 'Alert' | 'Offline';
export type SimulationProfile = 'steady' | 'balanced' | 'burst';

export interface SimulationRow {
  id: string;
  documentName: string;
  reportingPeriod: string;
  businessUnit: string;
  status: SimulationStatus;
  totalAssetsBillion: number;
  netIncomeMillion: number;
  tier1CapitalRatio: number;
  efficiencyRatio: number;
  updatedAt: number;
}

export type SimulationStatusCounts = Record<SimulationStatus, number>;

interface SimulationProfilePreset {
  label: string;
  description: string;
  tickIntervalMs: number;
  mutationBatchSize: number;
}

export const SIMULATION_STATUSES = [
  'Healthy',
  'Pending',
  'Alert',
  'Offline',
] as const satisfies readonly SimulationStatus[];

export const SIMULATION_PROFILES = {
  steady: {
    label: 'Steady',
    description: 'Slow updates that highlight incremental row changes.',
    tickIntervalMs: 1200,
    mutationBatchSize: 18,
  },
  balanced: {
    label: 'Balanced',
    description: 'A practical default for a live dashboard workload.',
    tickIntervalMs: 450,
    mutationBatchSize: 60,
  },
  burst: {
    label: 'Burst',
    description: 'Frequent updates that stress sorting and filtering paths.',
    tickIntervalMs: 180,
    mutationBatchSize: 140,
  },
} satisfies Record<SimulationProfile, SimulationProfilePreset>;

export const DATASET_OPTIONS = [2000, 12000, 25000] as const;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

const REPORTING_PERIODS = ['FY 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'] as const;
const BUSINESS_UNITS = [
  'Retail Banking',
  'Commercial Banking',
  'Treasury',
  'Mortgage',
  'Wealth Management',
] as const;
const DOCUMENT_NAMES = [
  'Balance Sheet',
  'Income Statement',
  'Cash Flow Statement',
  'Liquidity Coverage Report',
  'Credit Risk Dashboard',
  'Basel III Capital Report',
  'Loan Performance Summary',
  'Deposit Mix Analysis',
] as const;

@Injectable({
  providedIn: 'root',
})
export class TableSimulation {
  private readonly _datasetSize = signal<number>(12000);
  private readonly _profile = signal<SimulationProfile>('balanced');
  private readonly _isRunning = signal(true);
  private readonly _rows = signal<SimulationRow[]>(buildDataset(this._datasetSize()));
  private readonly _lastMutationSize = signal(0);
  private readonly _lastCycleDurationMs = signal(0);
  private readonly _lastTickAt = signal(Date.now());
  private readonly _totalMutations = signal(0);

  readonly datasetSize = this._datasetSize.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly isRunning = this._isRunning.asReadonly();
  readonly rows = this._rows.asReadonly();
  readonly lastMutationSize = this._lastMutationSize.asReadonly();
  readonly lastCycleDurationMs = this._lastCycleDurationMs.asReadonly();
  readonly lastTickAt = this._lastTickAt.asReadonly();
  readonly totalMutations = this._totalMutations.asReadonly();
  readonly profilePreset = computed(() => SIMULATION_PROFILES[this._profile()]);
  readonly statusCounts = computed<SimulationStatusCounts>(() => {
    const counts: SimulationStatusCounts = {
      Healthy: 0,
      Pending: 0,
      Alert: 0,
      Offline: 0,
    };

    for (const row of this._rows()) {
      counts[row.status] += 1;
    }

    return counts;
  });
  readonly fleetHealth = computed(() => {
    const counts = this.statusCounts();
    const degraded = counts.Pending + counts.Alert * 2 + counts.Offline * 3;
    const total = this._rows().length || 1;
    const ratio = Math.max(0, 100 - (degraded / total) * 100);
    return Math.round(ratio);
  });

  constructor() {
    effect((onCleanup) => {
      if (!this._isRunning()) {
        return;
      }

      const timer = globalThis.setInterval(
        () => this.pulse(),
        this.profilePreset().tickIntervalMs,
      );

      onCleanup(() => globalThis.clearInterval(timer));
    });
  }

  setDatasetSize(size: number): void {
    if (size === this._datasetSize()) {
      return;
    }

    this._datasetSize.set(size);
    this._rows.set(buildDataset(size));
    this.resetMutationStats();
  }

  setProfile(profile: SimulationProfile): void {
    this._profile.set(profile);
  }

  toggleRunning(): void {
    this._isRunning.update((value) => !value);
  }

  pause(): void {
    this._isRunning.set(false);
  }

  pulse(): void {
    const currentRows = this._rows();

    if (!currentRows.length) {
      return;
    }

    const now = Date.now();
    const startedAt = performance.now();
    const { rows, updatedCount } = mutateRows(
      currentRows,
      this.profilePreset().mutationBatchSize,
      now,
    );

    this._rows.set(rows);
    this._lastMutationSize.set(updatedCount);
    this._lastTickAt.set(now);
    this._lastCycleDurationMs.set(roundToSingleDecimal(performance.now() - startedAt));
    this._totalMutations.update((total) => total + updatedCount);
  }

  private resetMutationStats(): void {
    this._lastMutationSize.set(0);
    this._lastCycleDurationMs.set(0);
    this._lastTickAt.set(Date.now());
    this._totalMutations.set(0);
  }
}

function buildDataset(size: number): SimulationRow[] {
  const baseTimestamp = Date.now();

  return Array.from({ length: size }, (_, index) => {
    const documentName = DOCUMENT_NAMES[index % DOCUMENT_NAMES.length];
    const reportingPeriod = REPORTING_PERIODS[index % REPORTING_PERIODS.length];
    const businessUnit = BUSINESS_UNITS[index % BUSINESS_UNITS.length];
    const status = SIMULATION_STATUSES[index % SIMULATION_STATUSES.length];

    return {
      id: `doc-${String(index + 1).padStart(5, '0')}`,
      documentName: `${documentName} ${Math.floor(index / DOCUMENT_NAMES.length) + 1}`,
      reportingPeriod,
      businessUnit,
      status,
      totalAssetsBillion: 120 + ((index * 37) % 980),
      netIncomeMillion: 40 + ((index * 53) % 920),
      tier1CapitalRatio: Number((0.095 + ((index * 7) % 80) / 1000).toFixed(3)),
      efficiencyRatio: Number((0.41 + ((index * 11) % 280) / 1000).toFixed(3)),
      updatedAt: baseTimestamp - (index % 180) * 1000,
    };
  });
}

function mutateRows(
  rows: readonly SimulationRow[],
  batchSize: number,
  now: number,
): { rows: SimulationRow[]; updatedCount: number } {
  const nextRows = rows.slice();
  const pickedIndexes = new Set<number>();

  while (pickedIndexes.size < Math.min(batchSize, rows.length)) {
    pickedIndexes.add(Math.floor(Math.random() * rows.length));
  }

  for (const index of pickedIndexes) {
    nextRows[index] = mutateRow(nextRows[index], now);
  }

  return { rows: nextRows, updatedCount: pickedIndexes.size };
}

function mutateRow(row: SimulationRow, now: number): SimulationRow {
  return {
    ...row,
    status: nextStatus(row.status),
    totalAssetsBillion: clamp(
      Math.round(row.totalAssetsBillion + jitter(22)),
      80,
      1400,
    ),
    netIncomeMillion: clamp(Math.round(row.netIncomeMillion + jitter(65)), -120, 1600),
    tier1CapitalRatio: roundToThousandths(
      clamp(row.tier1CapitalRatio + jitter(0.008), 0.07, 0.24),
    ),
    efficiencyRatio: roundToThousandths(
      clamp(row.efficiencyRatio + jitter(0.02), 0.32, 0.9),
    ),
    updatedAt: now,
  };
}

function nextStatus(current: SimulationStatus): SimulationStatus {
  const roll = Math.random();

  switch (current) {
    case 'Healthy':
      if (roll < 0.76) {
        return 'Healthy';
      }

      if (roll < 0.92) {
        return 'Pending';
      }

      return 'Alert';
    case 'Pending':
      if (roll < 0.36) {
        return 'Healthy';
      }

      if (roll < 0.78) {
        return 'Pending';
      }

      return 'Alert';
    case 'Alert':
      if (roll < 0.22) {
        return 'Pending';
      }

      if (roll < 0.8) {
        return 'Alert';
      }

      return 'Offline';
    case 'Offline':
      if (roll < 0.58) {
        return 'Alert';
      }

      return 'Offline';
  }
}

function jitter(span: number): number {
  return (Math.random() - 0.5) * span * 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}

function roundToThousandths(value: number): number {
  return Number(value.toFixed(3));
}
