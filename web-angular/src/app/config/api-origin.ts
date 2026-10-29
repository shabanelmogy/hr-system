import { InjectionToken } from '@angular/core';

/** Public deployment value only. API credentials and secrets never belong here. */
export const ERP_API_ORIGIN = new InjectionToken<string>('ERP_API_ORIGIN', {
  providedIn: 'root', factory: () => 'https://localhost:7037',
});
