import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { parseModuleCatalog } from '../types/module-contracts';

@Injectable({ providedIn: 'root' })
export class ModuleCatalogService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin) throw new Error('An exact HTTPS API origin is required.');
  }
  accessible() {
    return this.http.get<unknown>(this.origin + '/api/v1/modules/accessible', { withCredentials: true })
      .pipe(timeout(10_000), map(parseModuleCatalog));
  }
}
