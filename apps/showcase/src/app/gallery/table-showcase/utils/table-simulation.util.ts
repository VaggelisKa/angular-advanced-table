import { DEFAULT_SIMULATION_TIMESTAMP, DESKS, EXCHANGES, INSTRUMENTS, SPARK_HISTORY_LENGTH } from '../common/table-simulation.const';
import type { SimulationRow, SimulationStatus, SparkTrend } from '../common/table-simulation.type';

export const roundToSingleDecimal = (value: number): number => Number(value.toFixed(1));

export const roundToHundredths = (value: number): number => Number(value.toFixed(2));

export const roundToCents = (value: number): number => Number(value.toFixed(2));

export const jitter = (span: number): number => (Math.random() - 0.5) * span * 2;

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const computeSparkTrend = (history: readonly number[]): SparkTrend => {
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

export const pushPriceHistory = (history: readonly number[], nextPrice: number): number[] => {
  const next: number[] = [];
  const start = Math.max(history.length - (SPARK_HISTORY_LENGTH - 1), 0);

  for (let index = start; index < history.length; index += 1) {
    next.push(history[index]);
  }

  next.push(nextPrice);

  return next;
};

export const statusFromChangePercent = (changePercent: number, isHalted = false): SimulationStatus => {
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

export const seedPriceHistory = (index: number, previousClose: number, currentPrice: number): number[] => {
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

export const mutateRow = (row: SimulationRow, now: number): SimulationRow => {
  const staysHalted = row.status === 'Halted' ? Math.random() < 0.72 : Math.random() < 0.018;
  const priceStep = Math.max(row.previousClose * 0.035, 0.18);
  const price = staysHalted
    ? row.price
    : roundToCents(clamp(row.price + jitter(priceStep), row.previousClose * 0.78, row.previousClose * 1.22));
  const change = roundToCents(price - row.previousClose);
  const changePercent = roundToHundredths((change / row.previousClose) * 100);
  const volume = clamp(Math.round(row.volume + jitter(Math.max(row.volume * 0.08, 150_000))), 40_000, 32_000_000);
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
    sparkTrend: computeSparkTrend(priceHistory)
  };
};

export const mutateRows = (
  rows: readonly SimulationRow[],
  batchSize: number,
  now: number
): { readonly rows: SimulationRow[]; readonly updatedCount: number } => {
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

export const buildDataset = (size: number, baseTimestamp = DEFAULT_SIMULATION_TIMESTAMP): SimulationRow[] =>
  Array.from({ length: size }, (_, index) => {
    const instrument = INSTRUMENTS[index % INSTRUMENTS.length];
    const seriesNumber = Math.floor(index / INSTRUMENTS.length) + 1;
    const previousClose = roundToCents(18 + ((index * 19) % 380) + (index % 7) * 0.37);
    const changePercent = roundToHundredths(((index * 37) % 1400) / 100 - 7);
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
      sparkTrend: computeSparkTrend(priceHistory)
    };
  });
