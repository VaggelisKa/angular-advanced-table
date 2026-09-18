import type { RowRenderTone } from '../../render-metrics.type';

/* Shared Danish (`da`) wording helpers for the built-in Danish locale dictionaries. */

export const rows = (count: number): string => (count === 1 ? 'række' : 'rækker');

export const items = (count: number): string => (count === 1 ? 'element' : 'elementer');

export const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');

export const visibleFields = (count: number): string => (count === 1 ? 'synligt felt' : 'synlige felter');

export const filteredRows = (count: number): string => (count === 1 ? 'filtreret række' : 'filtrerede rækker');

export const selectedRows = (count: number): string => (count === 1 ? 'række er valgt' : 'rækker er valgt');

export const measuredRows = (count: number): string => (count === 1 ? 'række målt' : 'rækker målt');

export const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig række målt' : 'synlige rækker målt');

export const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigende' : 'faldende');

export const side = (target: 'left' | 'right'): string => (target === 'left' ? 'til venstre' : 'til højre');

export const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'højre'}`;

export const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'vises' : 'skjules');

export const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'blandt kolonner fastgjort til venstre';
  }

  if (zone === 'right') {
    return 'blandt kolonner fastgjort til højre';
  }

  return 'blandt ikke-fastgjorte kolonner';
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
      return 'Hurtig';
    case 'watch':
      return 'Hold øje';
    case 'slow':
      return 'Langsom';
    case 'idle':
      return 'Inaktiv';
  }
};
