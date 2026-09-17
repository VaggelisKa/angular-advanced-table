import type { RowRenderFilterOption, RowRenderTone } from '../../render-metrics.type';

/* Shared Finnish (`fi`) wording helpers for the built-in Finnish locale dictionaries. */

export const rows = (count: number): string => (count === 1 ? 'rivi' : 'riviä');

export const items = (count: number): string => (count === 1 ? 'kohde' : 'kohdetta');

export const columns = (count: number): string => (count === 1 ? 'sarake' : 'saraketta');

export const fields = (count: number): string => (count === 1 ? 'kenttä' : 'kenttää');

export const filteredRows = (count: number): string => (count === 1 ? 'suodatettu rivi' : 'suodatettua riviä');

export const matchingRows = (count: number): string => (count === 1 ? 'vastaava rivi' : 'vastaavaa riviä');

export const selectedRows = (count: number): string => (count === 1 ? 'rivi valittu' : 'riviä valittu');

export const measuredRows = (count: number): string => (count === 1 ? 'rivi mitattu' : 'riviä mitattu');

export const measuredVisibleRows = (count: number): string => (count === 1 ? 'näkyvä rivi mitattu' : 'näkyvää riviä mitattu');

export const sortAdverb = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'nousevasti' : 'laskevasti');

export const sortOrder = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'nousevaan' : 'laskevaan');

export const side = (target: 'left' | 'right'): string => (target === 'left' ? 'vasemmalle' : 'oikealle');

export const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string => {
  if (toggleAction === 'unpin') {
    return pinSide === 'left' ? 'vasemmalta' : 'oikealta';
  }

  return side(pinSide);
};

export const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string =>
  visibilityState === 'visible' ? 'näytetään' : 'piilotetaan';

export const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'vasemmalle kiinnitettyjen sarakkeiden joukossa';
  }

  if (zone === 'right') {
    return 'oikealle kiinnitettyjen sarakkeiden joukossa';
  }

  return 'kiinnittämättömien sarakkeiden joukossa';
};

export const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (vähimmäisleveys)';
  }

  if (atMaximum) {
    return ' (enimmäisleveys)';
  }

  return '';
};

export const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Nopea';
    case 'watch':
      return 'Tarkkaile';
    case 'slow':
      return 'Hidas';
    case 'idle':
      return 'Ei mittausta';
  }
};

export const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Kaikki rivit', description: 'Näytä kaikki mitatut rivit' },
  { value: 'fast', label: 'Nopea', description: 'Nopeasti renderöityneet rivit' },
  { value: 'watch', label: 'Tarkkaile', description: 'Rivit, joita kannattaa tarkkailla' },
  { value: 'slow', label: 'Hidas', description: 'Hitaasti renderöityneet rivit' }
];
