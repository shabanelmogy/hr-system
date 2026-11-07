import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { parseCountryLookup } from '../types/country-lookup';
import { CountryLookupService } from './country-lookup-service';

describe('Country active lookup transport', () => {
  const origin = 'https://localhost:7037',
    url = origin + '/api/v1/countries/lookup';
  let service: CountryLookupService, http: HttpTestingController;
  const country = { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(CountryLookupService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('uses the retained credentials GET and accepts only active unique entries', async () => {
    const result = firstValueFrom(service.lookup()),
      request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush([country]);
    expect(await result).toEqual([country]);
  });
  it('rejects malformed, duplicate, and archived lookup options', () => {
    for (const value of [
      [{ ...country, id: '7' }],
      [country, country],
      [{ ...country, isDeleted: true }],
    ])
      expect(() => parseCountryLookup(value)).toThrow();
  });
});
