export type SimulationStatus = 'Advancing' | 'Watching' | 'Declining' | 'Halted';

export type SimulationProfile = 'steady' | 'balanced' | 'burst';

export type SparkTrend = 'up' | 'down' | 'flat';

export type SimulationRow = {
  readonly id: string;
  readonly symbol: string;
  readonly symbolSortKey: string;
  readonly company: string;
  readonly companySortKey: string;
  readonly exchange: string;
  readonly desk: string;
  readonly status: SimulationStatus;
  readonly previousClose: number;
  readonly price: number;
  readonly change: number;
  readonly changePercent: number;
  readonly volume: number;
  readonly turnoverMillions: number;
  readonly updatedAt: number;
  readonly priceHistory: readonly number[];
  readonly sparkTrend: SparkTrend;
};

export type SimulationStatusCounts = Record<SimulationStatus, number>;

export type SimulationProfilePreset = {
  readonly label: string;
  readonly description: string;
  readonly tickIntervalMs: number;
  readonly mutationBatchSize: number;
};

export type InstrumentSeed = {
  readonly symbol: string;
  readonly company: string;
};
