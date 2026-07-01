import type { InstrumentSeed, SimulationProfile, SimulationProfilePreset, SimulationStatus } from './table-simulation.type';

export const SPARK_HISTORY_LENGTH = 24;

export const SIMULATION_STATUSES = ['Advancing', 'Watching', 'Declining', 'Halted'] as const satisfies readonly SimulationStatus[];

export const SIMULATION_PROFILES = {
  steady: {
    label: 'Steady',
    description: 'A calmer tape that emphasizes individual movers.',
    tickIntervalMs: 1200,
    mutationBatchSize: 18
  },
  balanced: {
    label: 'Balanced',
    description: 'A live market pace with realistic turnover shifts.',
    tickIntervalMs: 450,
    mutationBatchSize: 60
  },
  burst: {
    label: 'Burst',
    description: 'A fast tape that stress-tests sorting and filtering.',
    tickIntervalMs: 180,
    mutationBatchSize: 140
  }
} satisfies Record<SimulationProfile, SimulationProfilePreset>;

export const DATASET_OPTIONS = [2000, 12000, 25000] as const;

export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export const DEFAULT_SIMULATION_TIMESTAMP = Date.UTC(2026, 0, 2, 9, 30, 0);

export const EXCHANGES = ['NASDAQ', 'NYSE', 'IEX', 'CBOE'] as const;

export const DESKS = ['Momentum', 'Macro', 'Quant', 'Delta One', 'Volatility'] as const;

export const INSTRUMENTS = [
  { symbol: 'AURA', company: 'Aurora Systems' },
  { symbol: 'BLZE', company: 'Blaze Networks' },
  { symbol: 'CRST', company: 'Crest Dynamics' },
  { symbol: 'DRFT', company: 'Drift Labs' },
  { symbol: 'ECHO', company: 'Echo Mobility' },
  { symbol: 'FLUX', company: 'Flux Energy' },
  { symbol: 'GLDN', company: 'Golden Vertex' },
  { symbol: 'HYPR', company: 'Hyper Grid' }
] as const satisfies readonly InstrumentSeed[];
