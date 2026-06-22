/* eslint-disable max-lines */
import { Injectable, computed, effect, signal } from '@angular/core';

export type SimulationStatus = 'Advancing' | 'Watching' | 'Declining' | 'Halted';

export type SimulationProfile = 'steady' | 'balanced' | 'burst';

export type SparkTrend = 'up' | 'down' | 'flat';

export type SimulationRow = {
  id: string;
  symbol: string;
  symbolSortKey: string;
  company: string;
  companySortKey: string;
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
  priceHistory: readonly number[];
  sparkTrend: SparkTrend;
};

export const SPARK_HISTORY_LENGTH = 24;

export type SimulationStatusCounts = Record<SimulationStatus, number>;

type SimulationProfilePreset = {
  label: string;
  description: string;
  tickIntervalMs: number;
  mutationBatchSize: number;
};

type InstrumentSeed = {
  symbol: string;
  company: string;
};

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

const roundToSingleDecimal = (value: number): number => Number(value.toFixed(1));

const roundToHundredths = (value: number): number => Number(value.toFixed(2));

const roundToCents = (value: number): number => Number(value.toFixed(2));

const jitter = (span: number): number => (Math.random() - 0.5) * span * 2;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const computeSparkTrend = (history: readonly number[]): SparkTrend => {
  if (history.length < 2) {
    return 'flat';
  }

  const first = history[0];
  const last = history[history.length - 1];
  const threshold = Math.max(first * 0.001, 0.01);

  if (last - first > threshold) {
    return 'up';
  }

  if (first - last > threshold) {
    return 'down';
  }

  return 'flat';
};

const pushPriceHistory = (history: readonly number[], nextPrice: number): number[] => {
  const next: number[] = [];
  const start = Math.max(history.length - (SPARK_HISTORY_LENGTH - 1), 0);

  for (let index = start; index < history.length; index += 1) {
    next.push(history[index]);
  }

  next.push(nextPrice);

  return next;
};

const statusFromChangePercent = (changePercent: number, isHalted = false): SimulationStatus => {
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
};

const seedPriceHistory = (
  index: number,
  previousClose: number,
  currentPrice: number,
): number[] => {
  const amplitude = Math.max(previousClose * 0.025, 0.3);
  const phase = (index % 11) * 0.41;
  const drift = (currentPrice - previousClose) / Math.max(SPARK_HISTORY_LENGTH - 1, 1);
  const history: number[] = [];

  for (let step = 0; step < SPARK_HISTORY_LENGTH; step += 1) {
    const wave = Math.sin(phase + step * 0.55) * amplitude * 0.6;
    const micro = Math.sin(phase * 2 + step * 1.3) * amplitude * 0.2;
    const value = previousClose + drift * step + wave + micro;

    history.push(roundToCents(Math.max(value, previousClose * 0.75)));
  }

  history[history.length - 1] = currentPrice;

  return history;
};

const mutateRow = (row: SimulationRow, now: number): SimulationRow => {
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
  const priceHistory = pushPriceHistory(row.priceHistory, price);

  return {
    ...row,
    status: statusFromChangePercent(changePercent, staysHalted),
    price,
    change,
    changePercent,
    volume,
    turnoverMillions: roundToSingleDecimal((price * volume) / 1_000_000),
    updatedAt: now,
    priceHistory,
    sparkTrend: computeSparkTrend(priceHistory),
  };
};

const mutateRows = (
  rows: readonly SimulationRow[],
  batchSize: number,
  now: number,
): { rows: SimulationRow[]; updatedCount: number } => {
  const nextRows = rows.slice();
  const pickedIndexes = new Set<number>();

  while (pickedIndexes.size < Math.min(batchSize, rows.length)) {
    pickedIndexes.add(Math.floor(Math.random() * rows.length));
  }

  for (const index of pickedIndexes) {
    nextRows[index] = mutateRow(nextRows[index], now);
  }

  return { rows: nextRows, updatedCount: pickedIndexes.size };
};

const buildDataset = (size: number): SimulationRow[] => {
  const baseTimestamp = Date.now();

  return Array.from({ length: size }, (_, index) => {
    const instrument = INSTRUMENTS[index % INSTRUMENTS.length];
    const seriesNumber = Math.floor(index / INSTRUMENTS.length) + 1;
    const previousClose = roundToCents(18 + ((index * 19) % 380) + ((index % 7) * 0.37));
    const changePercent = roundToHundredths((((index * 37) % 1400) / 100) - 7);
    const price = roundToCents(previousClose * (1 + changePercent / 100));
    const change = roundToCents(price - previousClose);
    const volume = 150_000 + ((index * 91_713) % 22_000_000);
    const priceHistory = seedPriceHistory(index, previousClose, price);

    return {
      id: `eqt-${String(index + 1).padStart(5, '0')}`,
      symbol: `${instrument.symbol}${String(seriesNumber).padStart(2, '0')}`,
      symbolSortKey: `${instrument.symbol}${String(seriesNumber).padStart(6, '0')}`,
      company: `${instrument.company} ${seriesNumber}`,
      companySortKey: `${instrument.company} ${String(seriesNumber).padStart(6, '0')}`,
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
      priceHistory,
      sparkTrend: computeSparkTrend(priceHistory),
    };
  });
};

@Injectable({
  providedIn: 'root',
})
export class TableSimulation {
  private readonly datasetSizeSignal = signal<number>(12000);
  private readonly profileSignal = signal<SimulationProfile>('balanced');
  private readonly isRunningSignal = signal(true);
  private readonly rowsSignal = signal<SimulationRow[]>(buildDataset(this.datasetSizeSignal()));
  private readonly lastMutationSizeSignal = signal(0);
  private readonly lastCycleDurationMsSignal = signal(0);
  private readonly lastTickAtSignal = signal(Date.now());
  private readonly totalMutationsSignal = signal(0);

  public readonly datasetSize = this.datasetSizeSignal.asReadonly();
  public readonly profile = this.profileSignal.asReadonly();
  public readonly isRunning = this.isRunningSignal.asReadonly();
  public readonly rows = this.rowsSignal.asReadonly();
  public readonly lastMutationSize = this.lastMutationSizeSignal.asReadonly();
  public readonly lastCycleDurationMs = this.lastCycleDurationMsSignal.asReadonly();
  public readonly lastTickAt = this.lastTickAtSignal.asReadonly();
  public readonly totalMutations = this.totalMutationsSignal.asReadonly();
  public readonly profilePreset = computed(() => SIMULATION_PROFILES[this.profileSignal()]);

  private readonly marketSnapshot = computed(() => {
    const counts: SimulationStatusCounts = {
      Advancing: 0,
      Watching: 0,
      Declining: 0,
      Halted: 0,
    };
    let positiveMoverCount = 0;
    const rows = this.rowsSignal();

    for (const row of rows) {
      counts[row.status] += 1;

      if (row.changePercent > 0) {
        positiveMoverCount += 1;
      }
    }

    const total = rows.length || 1;
    const weightedPositive = counts.Advancing + counts.Watching * 0.5;
    const marketBreadth = Math.round((weightedPositive / total) * 100);

    return {
      counts,
      positiveMoverCount,
      marketBreadth,
    };
  });

  public readonly statusCounts = computed<SimulationStatusCounts>(
    () => this.marketSnapshot().counts,
  );

  public readonly marketBreadth = computed(() => this.marketSnapshot().marketBreadth);
  public readonly positiveMoverCount = computed(() => this.marketSnapshot().positiveMoverCount);

  public constructor() {
    effect((onCleanup) => {
      if (!this.isRunningSignal()) {
        return;
      }

      const timer = globalThis.setInterval(
        () => this.pulse(),
        this.profilePreset().tickIntervalMs,
      );

      onCleanup(() => globalThis.clearInterval(timer));
    });
  }

  public setDatasetSize(size: number): void {
    if (size === this.datasetSizeSignal()) {
      return;
    }

    this.datasetSizeSignal.set(size);
    this.rowsSignal.set(buildDataset(size));
    this.resetMutationStats();
  }

  public setProfile(profile: SimulationProfile): void {
    this.profileSignal.set(profile);
  }

  public toggleRunning(): void {
    this.isRunningSignal.update((value) => !value);
  }

  public pause(): void {
    this.isRunningSignal.set(false);
  }

  public pulse(): void {
    const currentRows = this.rowsSignal();

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

    this.rowsSignal.set(rows);
    this.lastMutationSizeSignal.set(updatedCount);
    this.lastTickAtSignal.set(now);
    this.lastCycleDurationMsSignal.set(roundToSingleDecimal(performance.now() - startedAt));
    this.totalMutationsSignal.update((total) => total + updatedCount);
  }

  private resetMutationStats(): void {
    this.lastMutationSizeSignal.set(0);
    this.lastCycleDurationMsSignal.set(0);
    this.lastTickAtSignal.set(Date.now());
    this.totalMutationsSignal.set(0);
  }
}
