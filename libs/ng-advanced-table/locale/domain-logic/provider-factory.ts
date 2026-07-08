import { Optional, SkipSelf } from '@angular/core';
import type { InjectionToken, Provider } from '@angular/core';

type NatTableProviderFactory<TStaticConfig> = () => TStaticConfig;

type NatTableProviderConfig<TStaticConfig extends object> = TStaticConfig | NatTableProviderFactory<TStaticConfig>;

const resolveNatTableProviderConfig = <TStaticConfig extends object>(config: NatTableProviderConfig<TStaticConfig>): TStaticConfig =>
  typeof config === 'function' ? config() : config;

export const createNatTableMergedProvider = <TConfig, TStaticConfig extends object>(
  token: InjectionToken<TConfig>,
  defaultConfig: TConfig,
  config: NatTableProviderConfig<TStaticConfig>,
  mergeConfig: (parent: TConfig, override: TStaticConfig) => TConfig
): Provider[] => {
  return [
    {
      provide: token,
      deps: [[new Optional(), new SkipSelf(), token]],
      useFactory: (parent: TConfig | null) => mergeConfig(parent ?? defaultConfig, resolveNatTableProviderConfig(config))
    }
  ];
};
