import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { AdvancedToolService } from './advanced-tool-service';

describe('Operational tool reads', () => {
  const origin = 'https://localhost:7037';
  let service: AdvancedToolService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(AdvancedToolService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('uses credentialed detailed health and displays a valid Unhealthy 503 report', async () => {
    const result = firstValueFrom(service.health());
    const request = http.expectOne(origin + '/health');
    expect(request.request.withCredentials).toBe(true);
    request.flush(
      {
        status: 'Unhealthy',
        totalDuration: '00:00:01',
        entries: {
          sql: { status: 'Unhealthy', duration: '00:00:01', description: 'Database unavailable' },
        },
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    expect(await result).toEqual({
      status: 'Unhealthy',
      totalDuration: '00:00:01',
      entries: [
        {
          name: 'sql',
          status: 'Unhealthy',
          duration: '00:00:01',
          description: 'Database unavailable',
        },
      ],
    });
  });
  it('rejects a gateway HTML/invalid 503 body instead of inventing a report', async () => {
    const result = firstValueFrom(service.health());
    const failure = expect(result).rejects.toBeDefined();
    http
      .expectOne(origin + '/health')
      .flush('<html>gateway</html>', { status: 503, statusText: 'Unavailable' });
    await failure;
  });
  it('checks the real Hangfire HTML with browser credentials before embedding', async () => {
    const result = firstValueFrom(service.hangfire());
    const request = http.expectOne(origin + '/hangfire');
    expect(request.request.withCredentials).toBe(true);
    request.flush('<!doctype html><title>Hangfire Dashboard</title>', {
      headers: { 'Content-Type': 'text/html' },
    });
    expect(await result).toBeUndefined();
  });
  it('rejects an empty or gateway response rather than displaying a blank frame', async () => {
    const result = firstValueFrom(service.hangfire());
    const failure = expect(result).rejects.toBeDefined();
    http.expectOne(origin + '/hangfire').flush('', { headers: { 'Content-Type': 'text/html' } });
    await failure;
  });
});
