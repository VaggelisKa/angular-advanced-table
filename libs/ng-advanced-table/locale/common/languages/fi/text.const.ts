import type { RowRenderTone } from '../../render-metrics.type';

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
    return 'kiinnitetty vasemmalle';
  }

  if (zone === 'right') {
    return 'kiinnitetty oikealle';
  }

  return 'ei kiinnitetty';
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
