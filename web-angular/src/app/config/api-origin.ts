import { InjectionToken } from '@angular/core';
import { apiOrigin } from '../../config/api.generated';

/** Public deployment value only. API credentials and secrets never belong here. */
export const ERP_API_ORIGIN = new InjectionToken<string>('ERP_API_ORIGIN', {
  providedIn: 'root', factory: () => apiOrigin,
});
