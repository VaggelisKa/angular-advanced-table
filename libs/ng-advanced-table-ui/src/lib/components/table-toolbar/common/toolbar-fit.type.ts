import type { NatToolbarItemPosition, NatToolbarOverflowMode } from './toolbar-tokens.type';

/** Measurement + metadata snapshot for one registered item. */
export type NatToolbarFitItem = {
  readonly id: string;
  /** Last known outer width of the item host in px (margins included). */
  readonly width: number;
  readonly position: NatToolbarItemPosition;
  /** EFFECTIVE mode — pass `NatToolbarItemRef.effectiveOverflowMode()`. */
  readonly overflowMode: NatToolbarOverflowMode;
  /** Lower collapses first. */
  readonly priority: number;
  /** Index in registration (DOM) order, 0-based. */
  readonly domIndex: number;
  /** True when the item contains `document.activeElement` — pinned visible. */
  readonly focused: boolean;
};

export type NatToolbarFitInput = {
  /** Toolbar content-box width in px. Caller MUST skip the fit when 0. */
  readonly containerWidth: number;
  /** CSS flex `gap` between row children in px. */
  readonly gap: number;
  /** Width reserved for the More button in px (measured, or estimate before first paint). */
  readonly moreButtonWidth: number;
  items: NatToolbarFitItem[];
};

export type NatToolbarFitResult = {
  readonly hiddenIds: ReadonlySet<string>;
  readonly moreVisible: boolean;
};
