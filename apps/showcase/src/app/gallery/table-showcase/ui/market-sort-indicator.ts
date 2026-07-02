import { Component, input } from '@angular/core';

import type { NatTableSortIndicatorContext } from 'ng-advanced-table/components';

@Component({
  selector: 'app-market-sort-indicator',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      --msi-accent: var(--sc-accent, currentColor);
      --msi-idle: color-mix(in srgb, currentColor 55%, transparent);
      --msi-muted: color-mix(in srgb, currentColor 22%, transparent);
      --msi-hover: color-mix(in srgb, currentColor 85%, transparent);
      --msi-rail-bg: transparent;
      --msi-rail-bg-hover: color-mix(in srgb, currentColor 10%, transparent);
      --msi-rail-bg-active: color-mix(in srgb, var(--msi-accent) 16%, transparent);
      --msi-rail-ring-active: color-mix(in srgb, var(--msi-accent) 34%, transparent);
    }

    .market-sort-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.1rem;
      block-size: 1.1rem;
      padding: 2px;
      border-radius: 6px;
      background: var(--msi-rail-bg);
      transition:
        background-color 140ms ease,
        box-shadow 140ms ease;
    }

    .sort-stack {
      display: block;
      inline-size: 0.65rem;
      block-size: 0.85rem;
      overflow: visible;
    }

    .sort-chevron {
      transform-origin: center;
      transition:
        fill 140ms ease,
        opacity 140ms ease,
        transform 160ms ease;
    }

    .sort-chevron--up,
    .sort-chevron--down {
      fill: var(--msi-idle);
    }

    :host-context(.sort-button:hover) .market-sort-indicator {
      background: var(--msi-rail-bg-hover);
    }

    :host-context(.sort-button:hover) .market-sort-indicator[data-sort-state='none'] .sort-chevron {
      fill: var(--msi-hover);
    }

    .market-sort-indicator[data-sort-state='asc'],
    .market-sort-indicator[data-sort-state='desc'] {
      background: var(--msi-rail-bg-active);
      box-shadow: inset 0 0 0 1px var(--msi-rail-ring-active);
    }

    .market-sort-indicator[data-sort-state='asc'] .sort-chevron--up,
    .market-sort-indicator[data-sort-state='desc'] .sort-chevron--down {
      fill: var(--msi-accent);
      transform: scale(1.08);
    }

    .market-sort-indicator[data-sort-state='asc'] .sort-chevron--down,
    .market-sort-indicator[data-sort-state='desc'] .sort-chevron--up {
      fill: var(--msi-muted);
      opacity: 0.65;
    }
  `,
  template: `
    <span [attr.data-sort-state]="context().sortState || 'none'" class="market-sort-indicator">
      <svg aria-hidden="true" class="sort-stack" viewBox="0 0 12 16">
        <path class="sort-chevron sort-chevron--up" d="M6 2 10 6 H2z" />
        <path class="sort-chevron sort-chevron--down" d="M6 14 2 10 H10z" />
      </svg>
    </span>
  `
})
export class MarketSortIndicator {
  public readonly context = input.required<NatTableSortIndicatorContext>();
}
