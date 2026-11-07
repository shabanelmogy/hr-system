import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { parseCountryLookup } from '../types/country-lookup';

@Injectable({ providedIn: 'root' })
export class CountryLookupService {
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
        .get<unknown>(this.origin + '/api/v1/countries/lookup', { withCredentials: true })
        .pipe(timeout(10000), map(parseCountryLookup)),
    );
  }
}
