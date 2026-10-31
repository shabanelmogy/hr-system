import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { countryFixture, countryPageFixture } from '../country.fixture';
import { defaultCountryQuery } from '../types/country';
import { parseCountryFilters } from '../types/country-filters';
import { CountryService } from './country-service';
import { BrowserMutationSecurity } from '../../../../../platform/auth/session.public-api';

describe('Countries cookie read transport', () => {
  const origin = 'https://localhost:7037', base = origin + '/api/v1/countries';
  let service: CountryService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ERP_API_ORIGIN, useValue: origin },{provide:BrowserMutationSecurity,useValue:{csrf:()=>Promise.resolve('synthetic-filter-csrf')}}] });
    service = TestBed.inject(CountryService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { try { http.verify(); } finally { TestBed.resetTestingModule(); vi.useRealTimers(); } });
  const draft={nameAr:' مصر ',nameEn:' Egypt ',alpha2Code:'eg',alpha3Code:'',phoneCode:'+20',currencyCode:'egp'};
  it('sends exact cookie/CSRF lifecycle methods and accepts zero affected rows for an idempotent batch',async()=>{
    for(const[action,url,method]of [['archive',base+'/1','DELETE'],['restore',base+'/1/restore','POST']]as const){
      const result=firstValueFrom(service[action](1));await Promise.resolve();const request=http.expectOne(url);
      expect(request.request.method).toBe(method);expect(request.request.withCredentials).toBe(true);expect(request.request.headers.get('X-ERP-XSRF')).toBe('synthetic-filter-csrf');expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush(null,{status:204,statusText:'No Content'});expect(await result).toBe(1);
    }
    const result=firstValueFrom(service.bulkArchive([1,2]));await Promise.resolve();const request=http.expectOne(base+'/bulk-archive');expect(request.request.body).toEqual({ids:[1,2]});request.flush({archivedCount:0});expect(await result).toBe(0);
  });
  it('rejects invalid batches before dispatch and treats impossible successful counts as uncertain without replay',async()=>{
    for(const ids of [[],[1,1],[0],[1.5],Array.from({length:101},(_,i)=>i+1)])await expect(firstValueFrom(service.bulkArchive(ids))).rejects.toMatchObject({outcome:'not-sent'});
    http.expectNone(()=>true);
    const result=firstValueFrom(service.bulkArchive([1,2])),assertion=expect(result).rejects.toMatchObject({outcome:'uncertain'});await Promise.resolve();http.expectOne(base+'/bulk-archive').flush({archivedCount:3});await assertion;http.expectNone(()=>true);
  });
  it('preserves safe dependency codes on an authoritative lifecycle rejection',async()=>{
    const result=firstValueFrom(service.archive(1)),assertion=expect(result).rejects.toMatchObject({outcome:'rejected',codes:['Country.CountryInUseByState']});await Promise.resolve();http.expectOne(base+'/1').flush({errors:{'Country.CountryInUseByState':['Internal message not displayed']}},{status:400,statusText:'Rejected'});await assertion;
  });
  it('creates and updates only normalized six-field snapshots with cookies and CSRF',async()=>{
    const command=service.create(draft);http.expectNone(()=>true);const created=firstValueFrom(command);await Promise.resolve();const request=http.expectOne(base);
    expect(request.request.method).toBe('POST');expect(request.request.withCredentials).toBe(true);expect(request.request.headers.get('X-ERP-XSRF')).toBe('synthetic-filter-csrf');
    expect(request.request.body).toEqual({nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:null,phoneCode:'+20',currencyCode:'EGP'});request.flush(countryFixture,{status:201,statusText:'Created'});await created;
    const updated=firstValueFrom(service.update(1,draft));await Promise.resolve();const edit=http.expectOne(base+'/1');expect(edit.request.method).toBe('PUT');edit.flush(countryFixture);await updated;
  });
  it('maps authoritative field errors and marks malformed successful responses uncertain without replay',async()=>{
    const rejected=firstValueFrom(service.create(draft)),assertion=expect(rejected).rejects.toMatchObject({outcome:'rejected',fieldErrors:{nameAr:'Use a unique name'}});await Promise.resolve();http.expectOne(base).flush({errors:{NameAr:['Use a unique name']}},{status:400,statusText:'Invalid'});await assertion;
    const ambiguous=firstValueFrom(service.update(1,draft)),uncertain=expect(ambiguous).rejects.toMatchObject({outcome:'uncertain'});await Promise.resolve();http.expectOne(base+'/1').flush({id:'bad'});await uncertain;http.expectNone(()=>true);
  });
  it('does not dispatch an invalid command or silently accept a mismatched update result',async()=>{
    await expect(firstValueFrom(service.create({...draft,nameEn:' '}))).rejects.toMatchObject({outcome:'not-sent'});http.expectNone(()=>true);
    const result=firstValueFrom(service.update(2,draft)),assertion=expect(result).rejects.toMatchObject({outcome:'uncertain'});await Promise.resolve();http.expectOne(base+'/2').flush(countryFixture);await assertion;
  });
  it('preserves the existing hosted GET for a completely equivalent single text column rule',async()=>{
    const query={...defaultCountryQuery,filters:[{field:'nameEn',operator:'and' as const,constraints:[{matchMode:'contains' as const,value:'Egypt'}]}]};
    const result=firstValueFrom(service.page(query)),request=http.expectOne(req=>req.url===base);
    expect(request.request.method).toBe('GET');expect(request.request.params.get('searchField')).toBe('nameEn');expect(request.request.params.get('search')).toBe('Egypt');
    request.flush(countryPageFixture(query));await result;
  });
  it('posts all native AND/OR conditions with secure cookies and CSRF instead of dropping rules or filtering a page locally',async()=>{
    const query={...defaultCountryQuery,filters:[{field:'nameEn',operator:'or' as const,constraints:[{matchMode:'contains' as const,value:'Egypt'},{matchMode:'contains' as const,value:'Sudan'}]},{field:'id',operator:'and' as const,constraints:[{matchMode:'gte' as const,value:0}]}]};
    const result=firstValueFrom(service.page(query));await Promise.resolve();const request=http.expectOne(base+'/query');
    expect(request.request.method).toBe('POST');expect(request.request.withCredentials).toBe(true);expect(request.request.headers.get('X-ERP-XSRF')).toBe('synthetic-filter-csrf');expect(request.request.headers.has('Authorization')).toBe(false);expect(request.request.body.filters).toEqual(parseCountryFilters(query.filters));
    request.flush(countryPageFixture(query));await result;
  });
  it('retains the independent toolbar search when a native column rule also applies',async()=>{
    const query={...defaultCountryQuery,search:'Independent',filters:[{field:'nameEn',operator:'and' as const,constraints:[{matchMode:'contains' as const,value:'Egypt'}]}]};
    const result=firstValueFrom(service.page(query));await Promise.resolve();const request=http.expectOne(base+'/query');expect(request.request.body.search).toBe('Independent');expect(request.request.body.filters).toEqual(query.filters);request.flush(countryPageFixture(query));await result;
  });
  it('is cold, sends only an exact cookie GET and parses the current page', async () => {
    const read = service.page(defaultCountryQuery); http.expectNone(() => true);
    const result = firstValueFrom(read), request = http.expectOne(req => req.url === base);
    expect(request.request.method).toBe('GET'); expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.has('Authorization')).toBe(false); expect(request.request.headers.has('X-ERP-XSRF')).toBe(false);
    expect(request.request.params.get('pageNumber')).toBe('1'); expect(request.request.params.get('sortBy')).toBe('createdOn');
    request.flush(countryPageFixture()); expect((await result).items[0]).toEqual(countryFixture);
  });
  it('rejects invalid criteria and unsafe route IDs before HTTP', async () => {
    await expect(firstValueFrom(service.page({ ...defaultCountryQuery, search: 'x'.repeat(201) }))).rejects.toThrow();
    for (const id of [0, -1, 1.5, 2147483648]) await expect(firstValueFrom(service.detail(id))).rejects.toThrow();
    http.expectNone(() => true);
  });
  it('does not accept another country as detail and does not synthesize statesCount', async () => {
    const result = firstValueFrom(service.detail(1)), assertion = expect(result).rejects.toThrow('detail identity');
    http.expectOne(base + '/1').flush({ ...countryFixture, id: 2 }); await assertion;
    const correct = firstValueFrom(service.detail(1)); http.expectOne(base + '/1').flush(countryFixture);
    expect(await correct).not.toHaveProperty('statesCount');
  });
  it('aborts its pending GET when the owner unsubscribes', () => {
    const subscription = service.page(defaultCountryQuery).subscribe();
    const request = http.expectOne(req => req.url === base); subscription.unsubscribe(); expect(request.cancelled).toBe(true);
  });
  it('times out without replaying the read', async () => {
    vi.useFakeTimers();
    const result = firstValueFrom(service.page(defaultCountryQuery)), assertion = expect(result).rejects.toThrow();
    const request = http.expectOne(req => req.url === base); await vi.advanceTimersByTimeAsync(10001); await assertion;
    expect(request.cancelled).toBe(true); http.expectNone(() => true);
  });
  it('preserves server authority and rejects malformed successful responses', async () => {
    const denied = firstValueFrom(service.page(defaultCountryQuery)), assertion = expect(denied).rejects.toMatchObject({ status: 403 });
    http.expectOne(req => req.url === base).flush({}, { status: 403, statusText: 'Forbidden fixture' }); await assertion;
    const malformed = firstValueFrom(service.page(defaultCountryQuery)), invalid = expect(malformed).rejects.toThrow();
    http.expectOne(req => req.url === base).flush({ items: [], metaData: {} }); await invalid;
  });
});
