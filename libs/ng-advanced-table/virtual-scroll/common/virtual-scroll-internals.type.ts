import type { ListRange } from '@angular/cdk/collections';
import type { CdkVirtualScrollRepeater, CdkVirtualScrollViewport, CdkVirtualScrollableElement } from '@angular/cdk/scrolling';
import type { ApplicationRef, EnvironmentInjector, Injector, Signal } from '@angular/core';

import type { NatTableResolvedVirtualScrollOptions } from './virtual-scroll-options.type';

/** The keydown facts the keyboard takeover classifies (a `KeyboardEvent` subset). */
export type NatTableVirtualScrollKeyState = {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
};

/** Handle over a manually driven `CdkVirtualScrollableElement`; the creator owns `destroy`. */
export type NatTableRegionScrollableHandle = {
  readonly scrollable: CdkVirtualScrollableElement;
  readonly destroy: () => void;
};

/** Everything the headless-engine factory needs from the directive. */
export type NatTableVirtualScrollEngineConfig = {
  readonly region: HTMLElement;
  readonly injector: Injector;
  readonly environmentInjector: EnvironmentInjector;
  readonly applicationRef: ApplicationRef;
  readonly options: NatTableResolvedVirtualScrollOptions;
  readonly repeater: CdkVirtualScrollRepeater<unknown>;
  readonly onRenderedRange: (range: ListRange) => void;
};

/** Live handle over a mounted headless CDK engine. */
export type NatTableVirtualScrollEngineHandle = {
  readonly viewport: () => CdkVirtualScrollViewport;
  readonly syncOptions: (options: NatTableResolvedVirtualScrollOptions) => void;
  readonly destroy: () => void;
};

/** The windowed grid as the focus/keyboard service sees it. */
export type NatTableVirtualScrollGridContext = {
  readonly hostElement: HTMLElement;
  readonly region: HTMLElement;
  readonly headerRowCount: Signal<number>;
  readonly rowCount: Signal<number>;
  readonly renderedRowIndexes: Signal<readonly number[]>;
  readonly scrollToIndex: (index: number) => void;
};
