import { Component, computed, input } from '@angular/core';

import type { SparkTrend } from './table-simulation';

const VIEWBOX_HEIGHT = 100;

const pointBounds = (points: readonly number[]): { readonly min: number; readonly range: number } => {
  let min = points[0];
  let max = points[0];

  for (const point of points) {
    if (point < min) {
      min = point;
    }

    if (point > max) {
      max = point;
    }
  }

  const range = max - min || Math.abs(max) * 0.01 || 1;

  return { min, range };
};

const buildLinePath = (points: readonly number[]): string => {
  if (!points.length) {
    return '';
  }

  const { min, range } = pointBounds(points);
  let path = '';

  for (let index = 0; index < points.length; index += 1) {
    const x = index;
    const y = VIEWBOX_HEIGHT - ((points[index] - min) / range) * VIEWBOX_HEIGHT;

    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return path;
};

const buildAreaPath = (points: readonly number[]): string => {
  if (!points.length) {
    return '';
  }

  const line = buildLinePath(points);
  const endX = points.length - 1;

  return `${line}L${endX.toFixed(2)} ${VIEWBOX_HEIGHT}L0 ${VIEWBOX_HEIGHT}Z`;
};

@Component({
  selector: 'nat-sparkline',
  template: `
    <svg [attr.viewBox]="viewBox()" aria-hidden="true" class="sparkline" focusable="false" preserveAspectRatio="none">
      <path [attr.d]="areaPath()" class="sparkline-area" />
      <path [attr.d]="linePath()" class="sparkline-line" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 72px;
      height: 22px;
      color: var(--text-muted, #8a94a0);
    }

    :host([data-trend='up']) {
      color: var(--positive, #127a3b);
    }

    :host([data-trend='down']) {
      color: var(--negative, #b42318);
    }

    .sparkline {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .sparkline-line {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
      stroke-linejoin: round;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }

    .sparkline-area {
      fill: currentColor;
      opacity: 0.14;
    }
  `,
  host: {
    '[attr.data-trend]': 'trend()'
  }
})
export class NatSparkline {
  public readonly points = input.required<readonly number[]>();
  public readonly trend = input<SparkTrend>('flat');

  protected readonly viewBox = computed(() => {
    const width = Math.max(this.points().length - 1, 1);

    return `0 0 ${width} ${VIEWBOX_HEIGHT}`;
  });

  protected readonly linePath = computed(() => buildLinePath(this.points()));
  protected readonly areaPath = computed(() => buildAreaPath(this.points()));
}
