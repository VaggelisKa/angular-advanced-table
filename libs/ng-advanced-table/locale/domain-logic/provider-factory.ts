import { Optional, SkipSelf, computed, isSignal } from '@angular/core';
import type { InjectionToken, Provider, Signal } from '@angular/core';

type NatTableProviderSource<TStaticConfig extends object> = TStaticConfig | Signal<TStaticConfig>;

type NatTableProviderFactory<TStaticConfig extends object> = () => NatTableProviderSource<TStaticConfig>;

type NatTableProviderConfig<TStaticConfig extends object> =
  | NatTableProviderSource<TStaticConfig>
  | NatTableProviderFactory<TStaticConfig>;

type NatTableLiveConfig = {
  readonly locales?: unknown;
};

const isSignalOf = <T>(value: unknown): value is Signal<T> => isSignal(value);

const resolveNatTableProviderConfig = <TStaticConfig extends object>(
  config: NatTableProviderConfig<TStaticConfig>
): Signal<TStaticConfig> => {
  if (isSignalOf<TStaticConfig>(config)) {
    return config;
  }

  const resolved = typeof config === 'function' ? config() : config;

  return isSignalOf<TStaticConfig>(resolved) ? resolved : computed(() => resolved);
};

const createLiveConfigFacade = <TConfig extends NatTableLiveConfig>(config: Signal<TConfig>): TConfig => {
  const liveConfig = {
    get locales(): TConfig['locales'] {
      return config().locales;
    }
  };

  // The three supported configs contain only `locales`; the generic preserves each token's precise dictionary type.
  return liveConfig as TConfig;
};

export const mapNatTableProviderConfig = <TSource extends object, TResult extends object>(
  config: NatTableProviderConfig<TSource>,
  map: (source: TSource) => TResult
): NatTableProviderConfig<TResult> => {
  if (isSignalOf<TSource>(config)) {
    return computed(() => map(config()));
  }

  if (typeof config === 'function') {
    return () => {
      const resolved = config();

      return isSignalOf<TSource>(resolved) ? computed(() => map(resolved())) : map(resolved);
    };
  }

  return map(config);
};

export const createNatTableMergedProvider = <TConfig extends NatTableLiveConfig, TStaticConfig extends object>(
  token: InjectionToken<TConfig>,
  defaultConfig: TConfig,
  config: NatTableProviderConfig<TStaticConfig>,
  mergeConfig: (parent: TConfig, override: TStaticConfig) => TConfig
): Provider[] => {
  return [
    {
      provide: token,
      deps: [[new Optional(), new SkipSelf(), token]],
      useFactory: (parent: TConfig | null): TConfig => {
        const source = resolveNatTableProviderConfig(config);
        const merged = computed(() => mergeConfig(parent ?? defaultConfig, source()));

        return createLiveConfigFacade(merged);
      }
    }
  ];
};
