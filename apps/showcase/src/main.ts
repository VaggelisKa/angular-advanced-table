import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/shell/app';
import { appConfig } from './app/shell/config/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
