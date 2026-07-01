import type { ApplicationRef } from '@angular/core';
import type { BootstrapContext } from '@angular/platform-browser';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = async (context: BootstrapContext): Promise<ApplicationRef> => bootstrapApplication(App, config, context);

export default bootstrap;
