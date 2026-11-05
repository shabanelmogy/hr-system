import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAppTheme } from '../theme/public-api';
import { provideAppLocalization } from './platform/localization/presentation.public-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAppLocalization(),
    provideAppTheme(),
    provideRouter(routes, withRouterConfig({ canceledNavigationResolution: 'computed' }))
  ]
};
