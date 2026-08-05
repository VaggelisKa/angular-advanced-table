import type { Signal } from '@angular/core';

import type { NatTableControlsIntlStaticProviderConfig, NatTableControlsLocalesMap } from './controls.type';

/** Static or signal-backed companion-controls intl configuration. */
export type NatTableControlsIntlProviderSource =
  | NatTableControlsIntlStaticProviderConfig
  | Signal<NatTableControlsIntlStaticProviderConfig>;

/** Factory resolved once inside Angular dependency injection. Use `inject(...)` to read services. */
export type NatTableControlsIntlProviderFactory = () => NatTableControlsIntlProviderSource;

export type NatTableControlsIntlProviderConfig = NatTableControlsIntlProviderSource | NatTableControlsIntlProviderFactory;

/** Static or signal-backed companion-controls locale dictionaries. */
export type NatTableControlsLocalesProviderSource = NatTableControlsLocalesMap | Signal<NatTableControlsLocalesMap>;

/** Factory resolved once inside Angular dependency injection. */
export type NatTableControlsLocalesProviderFactory = () => NatTableControlsLocalesProviderSource;

/** Configuration accepted by `provideNatTableControlsLocales(...)`. */
export type NatTableControlsLocalesProviderConfig = NatTableControlsLocalesProviderSource | NatTableControlsLocalesProviderFactory;
