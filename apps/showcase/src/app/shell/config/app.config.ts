import { DOCUMENT, ViewportScroller } from '@angular/common';
import type { ApplicationConfig } from '@angular/core';
import {
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideNatTableControlsLocales, provideNatTableLocales, provideNatTableRenderMetricsLocales } from 'ng-advanced-table/locale';

import { AppTitleStrategy } from '../app.title-strategy';
import { routes } from '../routing/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideEnvironmentInitializer(() => {
      const viewportScroller = inject(ViewportScroller);
      const document = inject(DOCUMENT);

      /* Mirror the `scroll-margin-top` values on docs anchor targets: router
         anchor scrolling bypasses CSS scroll margins, so without this offset
         fragment targets land under the sticky mobile header. */
      viewportScroller.setOffset(() => [0, (document.defaultView?.innerWidth ?? 0) <= 820 ? 74 : 28]);
    }),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy
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
