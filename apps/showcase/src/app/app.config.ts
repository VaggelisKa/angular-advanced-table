import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNatTableLocales } from 'ng-advanced-table-locales';
import { provideNatTableUiLocales } from 'ng-advanced-table-locales/ui';
import { provideNatTableUtilsLocales } from 'ng-advanced-table-locales/utils';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNatTableLocales(),
    provideNatTableUiLocales(),
    provideNatTableUtilsLocales(),
    provideRouter(routes),
  ],
};
