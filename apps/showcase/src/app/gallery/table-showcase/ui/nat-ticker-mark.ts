import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'nat-ticker-mark',
  template: `
    <span class="ticker-root">
      <span aria-hidden="true" class="ticker-mark">{{ initials() }}</span>
      <span class="ticker-symbol">{{ symbol() }}</span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      min-width: 0;
    }

    .ticker-root {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .ticker-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      min-width: 1.6rem;
      height: 1.38rem;
      padding: 0 5px;
      border-radius: 6px;
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1;
      text-transform: uppercase;
      background: var(--sc-accent-soft, color-mix(in srgb, var(--sc-accent, #1f6feb) 14%, transparent));
      color: var(--sc-accent-strong, var(--sc-accent, #1f6feb));
      font-family: var(--sc-mono-font, ui-monospace, monospace);
    }

    .ticker-symbol {
      font-family: var(--sc-mono-font, ui-monospace, monospace);
      font-weight: 600;
      font-size: 0.82rem;
      font-variant-numeric: lining-nums tabular-nums;
      letter-spacing: 0.01em;
      color: var(--sc-text, inherit);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `
})
export class NatTickerMark {
  public readonly symbol = input.required<string>();

  protected readonly initials = computed(() => {
    const raw = this.symbol().trim();
    const letters = raw.replace(/[^A-Za-z]/g, '');

    if (letters.length >= 2) {
      return letters.slice(0, 2).toUpperCase();
    }

    if (letters.length === 1) {
      return letters.toUpperCase();
    }

    const fallback = raw.slice(0, 2).trim();

    return fallback ? fallback.toUpperCase() : '—';
  });
}
