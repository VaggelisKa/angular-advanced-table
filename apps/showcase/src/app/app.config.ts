import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideNatTableControlsLocales, provideNatTableLocales, provideNatTableRenderMetricsLocales } from 'ng-advanced-table/locale';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { ShowcaseTitleStrategy } from './showcase-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    {
      provide: TitleStrategy,
      useClass: ShowcaseTitleStrategy
    },
    provideMarkdown({
      loader: HttpClient,
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          gfm: true,
          breaks: false,
          pedantic: false
        }
      }
    }),
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
