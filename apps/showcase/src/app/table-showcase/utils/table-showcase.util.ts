import type { NatTableUserState } from 'ng-advanced-table';

import type { SimulationStatus } from '../common';

const integerFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const signedCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const signedPercentFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

export const formatInteger = (value: number): string => integerFormatter.format(value);

export const formatCompact = (value: number): string => compactFormatter.format(value);

export const formatCurrency = (value: number): string => currencyFormatter.format(value);

export const formatSignedCurrency = (value: number): string => signedCurrencyFormatter.format(value);

export const formatSignedPercent = (value: number): string => `${signedPercentFormatter.format(value)}%`;

export const formatTime = (value: number): string => timeFormatter.format(value);

export const compareSortKeys = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
};

export const numberTone = (value: number): 'positive' | 'negative' | 'neutral' => {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
};

export const statusTone = (status: SimulationStatus): 'positive' | 'negative' | 'neutral' | 'warning' => {
  switch (status) {
    case 'Advancing':
      return 'positive';
    case 'Declining':
      return 'negative';
    case 'Halted':
      return 'warning';
    case 'Watching':
      return 'neutral';
  }
};

export const upsertColumnFilter = (
  currentFilters: NonNullable<Partial<NatTableUserState>['columnFilters']>,
  columnId: string,
  value: unknown
): NonNullable<Partial<NatTableUserState>['columnFilters']> => {
  const nextFilters = currentFilters.filter((filter) => filter.id !== columnId);

  if (value === null) {
    return nextFilters;
  }

  return [
    ...nextFilters,
    {
      id: columnId,
      value
    }
  ];
};
