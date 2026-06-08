import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideNatTableLocales,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales';

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
