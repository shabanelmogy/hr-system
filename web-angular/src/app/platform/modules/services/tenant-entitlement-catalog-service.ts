import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { parseTenantEntitlementCatalog } from '../types/tenant-entitlement-catalog';

@Injectable({ providedIn: 'root' })
export class TenantEntitlementCatalogService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);

  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required.');
  }

  lookup() {
    return defer(() =>
      this.http
        .get<unknown>(this.origin + '/api/v1/modules/tenant-entitlements', {
          withCredentials: true,
        })
        .pipe(timeout(10000), map(parseTenantEntitlementCatalog)),
    );
  }
}
