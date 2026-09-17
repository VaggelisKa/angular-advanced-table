import type { RowRenderFilterOption, RowRenderTone } from './render-metrics.type';

/* Shared Norwegian Bokmål (`nb`) wording helpers for the built-in Norwegian Bokmål locale dictionaries. */

export const rows = (count: number): string => (count === 1 ? 'rad' : 'rader');

export const items = (count: number): string => (count === 1 ? 'element' : 'elementer');

export const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');

export const visibleFields = (count: number): string => (count === 1 ? 'synlig felt' : 'synlige felter');

export const filteredRows = (count: number): string => (count === 1 ? 'filtrert rad' : 'filtrerte rader');

export const selectedRows = (count: number): string => (count === 1 ? 'rad er valgt' : 'rader er valgt');

export const measuredRows = (count: number): string => (count === 1 ? 'rad målt' : 'rader målt');

export const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig rad målt' : 'synlige rader målt');

export const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigende' : 'synkende');

export const side = (target: 'left' | 'right'): string => (target === 'left' ? 'til venstre' : 'til høyre');

export const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'høyre'}`;

export const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'vises' : 'skjules');

export const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'blant kolonner som er festet til venstre';
  }

  if (zone === 'right') {
    return 'blant kolonner som er festet til høyre';
  }

  return 'blant kolonner som ikke er festet';
};

export const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (minimum)';
  }

  if (atMaximum) {
    return ' (maksimum)';
  }

  return '';
};

export const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Rask';
    case 'watch':
      return 'Følg med';
    case 'slow':
      return 'Treg';
    case 'idle':
      return 'Inaktiv';
  }
};

export const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alle rader', description: 'Vis alle målte rader' },
  { value: 'fast', label: 'Rask', description: 'Rader som ble gjengitt raskt' },
  { value: 'watch', label: 'Følg med', description: 'Rader som er verdt å følge med på' },
  { value: 'slow', label: 'Treg', description: 'Rader som ble gjengitt tregt' }
];
