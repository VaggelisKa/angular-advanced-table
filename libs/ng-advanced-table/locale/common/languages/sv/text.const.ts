import type { RowRenderFilterOption, RowRenderTone } from '../../render-metrics.type';

/* Shared Swedish (`sv`) wording helpers for the built-in Swedish locale dictionaries. */

export const rows = (count: number): string => (count === 1 ? 'rad' : 'rader');

export const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolumn' : 'synliga kolumner');

export const visibleFields = (count: number): string => (count === 1 ? 'synligt fält' : 'synliga fält');

export const filteredRows = (count: number): string => (count === 1 ? 'filtrerad rad' : 'filtrerade rader');

export const selectedRows = (count: number): string => (count === 1 ? 'rad är markerad' : 'rader är markerade');

export const measuredRows = (count: number): string => (count === 1 ? 'rad mätt' : 'rader mätta');

export const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig rad mätt' : 'synliga rader mätta');

export const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigande' : 'fallande');

export const side = (target: 'left' | 'right'): string => (target === 'left' ? 'till vänster' : 'till höger');

export const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'från' : 'till'} ${pinSide === 'left' ? 'vänster' : 'höger'}`;

export const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'visas' : 'döljs');

export const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'bland kolumner som är fästa till vänster';
  }

  if (zone === 'right') {
    return 'bland kolumner som är fästa till höger';
  }

  return 'bland kolumner som inte är fästa';
};

export const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (minimum)';
  }

  if (atMaximum) {
    return ' (maximum)';
  }

  return '';
};

export const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Snabb';
    case 'watch':
      return 'Bevaka';
    case 'slow':
      return 'Långsam';
    case 'idle':
      return 'Inaktiv';
  }
};

export const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alla rader', description: 'Visa alla mätta rader' },
  { value: 'fast', label: 'Snabb', description: 'Rader som renderades snabbt' },
  { value: 'watch', label: 'Bevaka', description: 'Rader som är värda att bevaka' },
  { value: 'slow', label: 'Långsam', description: 'Rader som renderades långsamt' }
];
