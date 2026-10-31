import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { validatePdfDocument, type PdfDocument } from '../../../../shared/data/public-api';
import { globalReportFixture as report } from '../report.fixture';
import { GlobalReportService } from '../services/global-report-service';
import { GlobalReportFailure } from '../types/global-report';
import { GlobalReportState } from './global-report-state';

describe('Global report lifetime and authorization', () => {
  const permitted: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['GlobalCrystalReports:View'],
  };
  const second = { ...report, id: 'c'.repeat(64), rowVersion: 'd'.repeat(64) };
  let document: PdfDocument;
  beforeEach(async () => {
    document = await validatePdfDocument(new Blob(['%PDF-1.7'], { type: 'application/pdf' }));
  });
  function setup(initial: Session = permitted) {
    const identity = signal<Session | null>(initial),
      language = signal<'en' | 'ar'>('en');
    const subscriptions: { subject: Subject<PdfDocument>; cancelled: boolean }[] = [];
    const service = {
      catalog: vi.fn(() => of([report, second])),
      render: vi.fn(
        () =>
          new Observable<PdfDocument>((observer) => {
            const entry = { subject: new Subject<PdfDocument>(), cancelled: false };
            subscriptions.push(entry);
            const subscription = entry.subject.subscribe(observer);
            return () => {
              entry.cancelled = true;
              subscription.unsubscribe();
            };
          }),
      ),
    };
    TestBed.configureTestingModule({
      providers: [
        GlobalReportState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LocalizationRuntime, useValue: { language } },
        { provide: GlobalReportService, useValue: service },
      ],
    });
    const state = TestBed.inject(GlobalReportState);
    TestBed.tick();
    return { identity, language, state, service, subscriptions };
  }
  it('makes zero catalog and PDF requests without both permissions', () => {
    const { state, service } = setup(sessionFixture);
    expect(state.view().kind).toBe('forbidden');
    expect(service.catalog).not.toHaveBeenCalled();
    expect(service.render).not.toHaveBeenCalled();
  });
  it('selects the first report once and cancels old rendering on selection or destruction', () => {
    const { state, service, subscriptions } = setup();
    expect(service.render).toHaveBeenCalledOnce();
    subscriptions[0].subject.next(document);
    expect(state.view().kind).toBe('ready');
    state.select(second.id);
    expect(state.view().kind).toBe('loading');
    TestBed.tick();
    expect(subscriptions[0].cancelled).toBe(true);
    expect(service.render).toHaveBeenCalledTimes(2);
    subscriptions[0].subject.next(document);
    expect(state.view().kind).toBe('loading');
    TestBed.resetTestingModule();
    expect(subscriptions[1].cancelled).toBe(true);
  });
  it('uses applied filters on language changes and rejects oversized or pending searches', () => {
    const { state, service, subscriptions, language } = setup();
    expect(state.search({ nameAr: 'مصر', nameEn: '' })).toBe(false);
    subscriptions[0].subject.next(document);
    expect(state.search({ nameAr: 'مصر', nameEn: '' })).toBe(true);
    TestBed.tick();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: 'مصر', nameEn: '' }, 'en');
    language.set('ar');
    expect(state.view().kind).toBe('loading');
    TestBed.tick();
    expect(subscriptions[1].cancelled).toBe(true);
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: 'مصر', nameEn: '' }, 'ar');
    subscriptions[2].subject.next(document);
    expect(state.search({ nameAr: 'ع'.repeat(201), nameEn: '' })).toBe(false);
    expect(state.reset()).toBe(true);
    TestBed.tick();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: '', nameEn: '' }, 'ar');
  });
  it('masks the old document synchronously on identity replacement and permission loss', () => {
    const { state, service, subscriptions, identity } = setup();
    subscriptions[0].subject.next(document);
    expect(state.view().kind).toBe('ready');
    identity.set({ ...permitted, companyId: 2 });
    expect(state.view().kind).toBe('loading');
    TestBed.tick();
    expect(subscriptions[0].cancelled).toBe(true);
    identity.set({ ...permitted, permissions: [] });
    expect(state.view().kind).toBe('forbidden');
    TestBed.tick();
    const count = service.render.mock.calls.length;
    state.reload();
    state.select(second.id);
    state.search({ nameAr: '', nameEn: '' });
    TestBed.tick();
    expect(service.render).toHaveBeenCalledTimes(count);
  });
  it('latches 403 for the current identity without repeating requests', () => {
    const { state, service, subscriptions, language } = setup();
    subscriptions[0].subject.error(new GlobalReportFailure('forbidden'));
    TestBed.tick();
    expect(state.view().kind).toBe('forbidden');
    state.reload();
    language.set('ar');
    TestBed.tick();
    expect(service.render).toHaveBeenCalledOnce();
  });
  it('requires a source reload after 409 and renders only the refreshed hash', () => {
    const { state, service, subscriptions, language } = setup();
    subscriptions[0].subject.error(new GlobalReportFailure('stale'));
    TestBed.tick();
    expect(state.view().kind).toBe('conflict');
    language.set('ar');
    TestBed.tick();
    expect(state.search({ nameAr: '', nameEn: '' })).toBe(false);
    expect(service.render).toHaveBeenCalledOnce();
    const changed = { ...report, rowVersion: 'e'.repeat(64) };
    service.catalog.mockReturnValue(of([changed]));
    state.reload();
    TestBed.tick();
    expect(service.render).toHaveBeenLastCalledWith(changed, { nameAr: '', nameEn: '' }, 'ar');
    subscriptions[1].subject.next(document);
    expect(state.view().kind).toBe('ready');
  });
  it('keeps a field rejection actionable without marking the source forbidden', () => {
    const { state, subscriptions } = setup();
    subscriptions[0].subject.error(
      new GlobalReportFailure('validation', { nameAr: 'Fixture error' }),
    );
    TestBed.tick();
    expect(state.view()).toMatchObject({
      kind: 'error',
      failure: { fields: { nameAr: 'Fixture error' } },
    });
    expect(state.search({ nameAr: 'مصر', nameEn: '' })).toBe(true);
  });
  it('never carries applied criteria or report selection to a replacement actor',()=>{
    const{state,identity,service,subscriptions}=setup();subscriptions[0].subject.next(document);
    state.select(second.id);TestBed.tick();subscriptions[1].subject.next(document);
    expect(state.search({nameAr:'Actor-owned',nameEn:''})).toBe(true);TestBed.tick();subscriptions[2].subject.next(document);
    identity.set({...permitted,companyId:42});
    expect(state.applied()).toEqual({nameAr:'',nameEn:''});expect(state.view().kind).toBe('loading');
    TestBed.tick();expect(service.render).toHaveBeenLastCalledWith(report,{nameAr:'',nameEn:''},'en');
    expect(subscriptions[2].cancelled).toBe(true);
  });
  it('explicit refresh regenerates once even when the eligible source hash is unchanged',()=>{
    const{state,service,subscriptions}=setup();subscriptions[0].subject.next(document);state.reload();TestBed.tick();
    expect(service.catalog).toHaveBeenCalledTimes(2);expect(service.render).toHaveBeenCalledTimes(2);
    expect(service.render).toHaveBeenLastCalledWith(report,{nameAr:'',nameEn:''},'en');
  });
});
