import { computed, effect, Injectable, signal } from '@angular/core';

export type SimulationStatus = 'Advancing' | 'Watching' | 'Declining' | 'Halted';
export type SimulationProfile = 'steady' | 'balanced' | 'burst';

export interface SimulationRow {
  id: string;
  symbol: string;
  company: string;
  exchange: string;
  desk: string;
  status: SimulationStatus;
  previousClose: number;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  turnoverMillions: number;
  updatedAt: number;
}

export type SimulationStatusCounts = Record<SimulationStatus, number>;

interface SimulationProfilePreset {
  label: string;
  description: string;
  tickIntervalMs: number;
  mutationBatchSize: number;
}

interface InstrumentSeed {
  symbol: string;
  company: string;
}

export const SIMULATION_STATUSES = [
  'Advancing',
  'Watching',
  'Declining',
  'Halted',
] as const satisfies readonly SimulationStatus[];

export const SIMULATION_PROFILES = {
  steady: {
    label: 'Steady',
    description: 'A calmer tape that emphasizes individual movers.',
    tickIntervalMs: 1200,
    mutationBatchSize: 18,
  },
  balanced: {
    label: 'Balanced',
    description: 'A live market pace with realistic turnover shifts.',
    tickIntervalMs: 450,
    mutationBatchSize: 60,
  },
  burst: {
    label: 'Burst',
    description: 'A fast tape that stress-tests sorting and filtering.',
    tickIntervalMs: 180,
    mutationBatchSize: 140,
  },
} satisfies Record<SimulationProfile, SimulationProfilePreset>;

export const DATASET_OPTIONS = [2000, 12000, 25000] as const;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

const EXCHANGES = ['NASDAQ', 'NYSE', 'IEX', 'CBOE'] as const;
const DESKS = ['Momentum', 'Macro', 'Quant', 'Delta One', 'Volatility'] as const;
const INSTRUMENTS = [
  { symbol: 'AURA', company: 'Aurora Systems' },
  { symbol: 'BLZE', company: 'Blaze Networks' },
  { symbol: 'CRST', company: 'Crest Dynamics' },
  { symbol: 'DRFT', company: 'Drift Labs' },
  { symbol: 'ECHO', company: 'Echo Mobility' },
  { symbol: 'FLUX', company: 'Flux Energy' },
  { symbol: 'GLDN', company: 'Golden Vertex' },
  { symbol: 'HYPR', company: 'Hyper Grid' },
] as const satisfies readonly InstrumentSeed[];

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
      Advancing: 0,
      Watching: 0,
      Declining: 0,
      Halted: 0,
    };

    for (const row of this._rows()) {
      counts[row.status] += 1;
    }

    return counts;
  });
  readonly marketBreadth = computed(() => {
    const counts = this.statusCounts();
    const total = this._rows().length || 1;
    const weightedPositive = counts.Advancing + counts.Watching * 0.5;

    return Math.round((weightedPositive / total) * 100);
  });
  readonly positiveMoverCount = computed(
    () => this._rows().filter((row) => row.changePercent > 0).length,
  );

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
    const instrument = INSTRUMENTS[index % INSTRUMENTS.length];
    const seriesNumber = Math.floor(index / INSTRUMENTS.length) + 1;
    const previousClose = roundToCents(18 + ((index * 19) % 380) + ((index % 7) * 0.37));
    const changePercent = roundToHundredths((((index * 37) % 1400) / 100) - 7);
    const price = roundToCents(previousClose * (1 + changePercent / 100));
    const change = roundToCents(price - previousClose);
    const volume = 150_000 + ((index * 91_713) % 22_000_000);

    return {
      id: `eqt-${String(index + 1).padStart(5, '0')}`,
      symbol: `${instrument.symbol}${String(seriesNumber).padStart(2, '0')}`,
      company: `${instrument.company} ${seriesNumber}`,
      exchange: EXCHANGES[index % EXCHANGES.length],
      desk: DESKS[index % DESKS.length],
      status: statusFromChangePercent(changePercent, index % 43 === 0),
      previousClose,
      price,
      change,
      changePercent,
      volume,
      turnoverMillions: roundToSingleDecimal((price * volume) / 1_000_000),
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
  const staysHalted =
    row.status === 'Halted' ? Math.random() < 0.72 : Math.random() < 0.018;
  const priceStep = Math.max(row.previousClose * 0.035, 0.18);
  const price = staysHalted
    ? row.price
    : roundToCents(
        clamp(row.price + jitter(priceStep), row.previousClose * 0.78, row.previousClose * 1.22),
      );
  const change = roundToCents(price - row.previousClose);
  const changePercent = roundToHundredths((change / row.previousClose) * 100);
  const volume = clamp(
    Math.round(row.volume + jitter(Math.max(row.volume * 0.08, 150_000))),
    40_000,
    32_000_000,
  );

  return {
    ...row,
    status: statusFromChangePercent(changePercent, staysHalted),
    price,
    change,
    changePercent,
    volume,
    turnoverMillions: roundToSingleDecimal((price * volume) / 1_000_000),
    updatedAt: now,
  };
}

function statusFromChangePercent(
  changePercent: number,
  isHalted: boolean = false,
): SimulationStatus {
  if (isHalted) {
    return 'Halted';
  }

  if (changePercent >= 1.25) {
    return 'Advancing';
  }

  if (changePercent <= -1.25) {
    return 'Declining';
  }

  return 'Watching';
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

function roundToHundredths(value: number): number {
  return Number(value.toFixed(2));
}

function roundToCents(value: number): number {
  return Number(value.toFixed(2));
}
