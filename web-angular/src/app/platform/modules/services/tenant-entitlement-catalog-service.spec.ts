import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { TenantEntitlementCatalogService } from './tenant-entitlement-catalog-service';

describe('Tenant entitlement catalog transport', () => {
  const origin = 'https://localhost:7037';
  let service: TenantEntitlementCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(TenantEntitlementCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('uses its own retained-credentials endpoint, never the accessible module catalog', async () => {
    const result = firstValueFrom(service.lookup());
    const request = http.expectOne(origin + '/api/v1/modules/tenant-entitlements');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush([{ code: 'hr', name: 'HR', isDefault: true, submodules: [] }]);
    expect((await result)[0]?.code).toBe('hr');
  });
});
