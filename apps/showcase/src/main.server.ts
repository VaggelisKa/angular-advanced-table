import type { ApplicationRef } from '@angular/core';
import type { BootstrapContext } from '@angular/platform-browser';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/shell/app';
import { config } from './app/shell/config/app.config.server';

const bootstrap = async (context: BootstrapContext): Promise<ApplicationRef> => bootstrapApplication(App, config, context);

export default bootstrap;
