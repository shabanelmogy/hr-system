import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { parseStateLookup } from '../types/state-lookup';
import { StateLookupService } from './state-lookup-service';

describe('State active lookup transport', () => {
  const origin = 'https://localhost:7037',
    url = origin + '/api/v1/states/lookup';
  let service: StateLookupService, http: HttpTestingController;
  const state = { id: 7, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 1 };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(StateLookupService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('uses the retained credentials GET and accepts the active endpoint contract with unique entries', async () => {
    const result = firstValueFrom(service.lookup()),
      request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush([state]);
    expect(await result).toEqual([state]);
  });
  it('rejects malformed, duplicate, and invalid parent lookup options', () => {
    for (const value of [[{ ...state, id: '7' }], [state, state], [{ ...state, countryId: 0 }]])
      expect(() => parseStateLookup(value)).toThrow();
  });
});
