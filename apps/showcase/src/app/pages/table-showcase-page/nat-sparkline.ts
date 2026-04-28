import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { SparkTrend } from './table-simulation';

const VIEWBOX_HEIGHT = 100;

@Component({
  selector: 'nat-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="sparkline"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path class="sparkline-area" [attr.d]="areaPath()" />
      <path class="sparkline-line" [attr.d]="linePath()" />
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
    '[attr.data-trend]': 'trend()',
  },
})
export class NatSparkline {
  readonly points = input.required<readonly number[]>();
  readonly trend = input<SparkTrend>('flat');

  protected readonly viewBox = computed(() => {
    const width = Math.max(this.points().length - 1, 1);
    return `0 0 ${width} ${VIEWBOX_HEIGHT}`;
  });

  protected readonly linePath = computed(() => buildLinePath(this.points()));
  protected readonly areaPath = computed(() => buildAreaPath(this.points()));
}

function buildLinePath(points: readonly number[]): string {
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
}

function buildAreaPath(points: readonly number[]): string {
  if (!points.length) {
    return '';
  }

  const line = buildLinePath(points);
  const endX = points.length - 1;
  return `${line}L${endX.toFixed(2)} ${VIEWBOX_HEIGHT}L0 ${VIEWBOX_HEIGHT}Z`;
}

function pointBounds(points: readonly number[]): { min: number; range: number } {
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
}
