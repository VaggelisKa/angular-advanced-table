import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideNatTableControlsLocales, provideNatTableLocales, provideNatTableRenderMetricsLocales } from 'ng-advanced-table/locale';

import { routes } from './app.routes';
import { ShowcaseTitleStrategy } from './showcase-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    {
      provide: TitleStrategy,
      useClass: ShowcaseTitleStrategy
    },
    provideNatTableLocales(),
    provideNatTableControlsLocales(),
    provideNatTableRenderMetricsLocales(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
};
