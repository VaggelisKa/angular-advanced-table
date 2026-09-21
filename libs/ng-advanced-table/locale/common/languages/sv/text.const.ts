import type { RowRenderTone } from '../../render-metrics.type';

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
    return 'fäst till vänster';
  }

  if (zone === 'right') {
    return 'fäst till höger';
  }

  return 'inte fäst';
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
