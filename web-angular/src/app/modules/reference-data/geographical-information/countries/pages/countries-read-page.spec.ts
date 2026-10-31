import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { countryFixture, countryPageFixture } from '../country.fixture';
import { countryDetailSchema, defaultCountryQuery, type CountryQuery } from '../types/country';
import { CountryService } from '../services/country-service';
import { CountriesReadPage } from './countries-read-page';
import { ChartPanel } from '../../../../../shared/ui/charts/public-api';
import { By } from '@angular/platform-browser';
import { GlobalReportView } from '../../../../reporting/public-api';
import { GlobalReportService } from '../../../../reporting/global-reports/services/global-report-service';
import { globalReportFixture } from '../../../../reporting/global-reports/report.fixture';
import { validatePdfDocument } from '../../../../../shared/data/public-api';

describe('Countries read composition', () => {
  async function setup(stubCharts=false) {
    const pdf=await validatePdfDocument(new Blob(['%PDF-fixture'],{type:'application/pdf'}));
    const reports={catalog:vi.fn(()=>of([globalReportFixture])),render:vi.fn(()=>of(pdf))};
    vi.stubGlobal('URL',class extends URL{static override createObjectURL=vi.fn(()=>'blob:https://fixture.test/countries');static override revokeObjectURL=vi.fn();});
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('matchMedia',()=>({matches:false,media:'',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));
    const identity = signal<Session | null>({ ...sessionFixture, roles: ['super_admin'], permissions: ['Countries:View'] });
    const service = { page: vi.fn((query: CountryQuery) => of(countryPageFixture(query))), detail: vi.fn(() => of(countryDetailSchema.parse(countryFixture))) };
    TestBed.configureTestingModule({ providers: [provideAppTheme(), { provide: AuthSession, useValue: { readIdentity: identity } }, { provide: CountryService, useValue: service },{provide:GlobalReportService,useValue:reports}] });
    if(stubCharts){TestBed.overrideComponent(ChartPanel,{set:{template:''}});await TestBed.compileComponents();}
    const locale = TestBed.inject(LocalizationRuntime); locale.setLanguage('en'); await locale.loadNamespace('core'); await locale.loadNamespace('reference-countries');
    const fixture = TestBed.createComponent(CountriesReadPage); await fixture.whenStable();
    return { fixture, owner: fixture.componentInstance, service, reports,locale, identity, root: fixture.nativeElement as HTMLElement };
  }
  afterEach(() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });
  it('requires report authority and composes one shared embedded report with independent criteria and refresh',async()=>{
    const{fixture,owner,reports,service,identity,root}=await setup(true);
    expect(owner.views().some(view=>view.id==='report')).toBe(false);owner.chooseView('report');await fixture.whenStable();expect(owner.view()).toBe('grid');expect(reports.catalog).not.toHaveBeenCalled();
    identity.set({...identity()!,permissions:['Countries:View','GlobalCrystalReports:View']});await fixture.whenStable();
    owner.state.changeStatus('all');await fixture.whenStable();const query={...owner.state.query()},reads=service.page.mock.calls.length;
    owner.chooseView('report');await fixture.whenStable();expect(root.querySelectorAll('erp-page-header')).toHaveLength(1);
    expect(reports.catalog).toHaveBeenCalledOnce();expect(reports.render).toHaveBeenLastCalledWith(globalReportFixture,{nameAr:'',nameEn:''},'en');expect(owner.state.query()).toEqual(query);expect(service.page.mock.calls.length).toBe(reads);
    const report=fixture.debugElement.query(By.directive(GlobalReportView)).componentInstance as GlobalReportView;
    report.form.controls.nameEn.setValue('Draft');owner.toolbarVisible.set(false);await fixture.whenStable();expect(root.querySelector('erp-report-workspace aside')).toBeNull();owner.toolbarVisible.set(true);await fixture.whenStable();expect(report.form.controls.nameEn.value).toBe('Draft');expect(reports.render).toHaveBeenCalledOnce();
    owner.refreshCurrent();await fixture.whenStable();expect(reports.catalog).toHaveBeenCalledTimes(2);expect(reports.render).toHaveBeenCalledTimes(2);expect(service.page.mock.calls.length).toBe(reads);
    identity.set({...identity()!,permissions:['Countries:View']});await fixture.whenStable();expect(owner.view()).toBe('grid');expect(root.querySelector('erp-global-report-view')).toBeNull();expect(URL.revokeObjectURL).toHaveBeenCalled();
  },15_000);
  it('resets Chart to page1 while preserving criteria, omits filters and masks charts on permission loss',async()=>{
    const{fixture,owner,service,locale,root,identity}=await setup(true);service.page.mockImplementation(query=>of(countryPageFixture(query,[countryFixture],21)));
    owner.state.changeStatus('all');owner.state.changeSort({field:'nameEn',direction:'asc'});await fixture.whenStable();owner.state.changePage({pageIndex:1,pageSize:10});await fixture.whenStable();expect(owner.state.query().pageNumber).toBe(2);
    owner.chooseView('chart');await fixture.whenStable();expect(owner.state.query()).toMatchObject({pageNumber:1,pageSize:10,status:'all',sortBy:'nameEn',sortDirection:'asc'});expect(root.querySelectorAll('erp-chart-panel')).toHaveLength(4);expect(root.querySelectorAll('erp-metric-card')).toHaveLength(4);expect(root.querySelector('.collection-toolbar')).toBeNull();expect(root.querySelector('erp-page-header .filter')).toBeNull();expect(root.textContent).not.toContain('Charts use the currently loaded page');
    const calls=service.page.mock.calls.length;locale.setLanguage('ar');await fixture.whenStable();expect(service.page.mock.calls.length).toBe(calls);identity.set({...sessionFixture,roles:['super_admin'],permissions:[]});await fixture.whenStable();expect(root.querySelector('erp-chart-panel')).toBeNull();expect(root.querySelector('erp-metric-card')).toBeNull();owner.chooseView('grid');expect(owner.view()).toBe('chart');
  });
  it('keeps Cards criteria on one shared row and preserves the header toggle state across Grid/Cards',async()=>{
    const{fixture,owner,root}=await setup();owner.chooseView('cards');await fixture.whenStable();expect(root.querySelector('.single-row-toolbar .collection-toolbar')).not.toBeNull();const toggle=()=>root.querySelector<HTMLButtonElement>('erp-page-header .filter button')!;
    toggle().click();await fixture.whenStable();expect(root.querySelector('.collection-toolbar')).toBeNull();owner.chooseView('grid');await fixture.whenStable();expect(root.querySelector('.collection-toolbar')).toBeNull();toggle().click();await fixture.whenStable();owner.chooseView('cards');await fixture.whenStable();expect(root.querySelector('.single-row-toolbar .collection-toolbar')).not.toBeNull();
    const direction=root.querySelector<HTMLButtonElement>('[data-testid=direction] button')!;expect(direction.textContent?.trim()).toBe('Desc');expect(direction.querySelector('svg')).not.toBeNull();direction.click();await fixture.whenStable();expect(owner.state.query().sortDirection).toBe('asc');expect(direction.textContent?.trim()).toBe('Asc');
  });
  it('uses real shared Grid/Cards with the same page owner and repaints language without another GET', async () => {
    const { fixture, owner, root, service, locale } = await setup();
    expect(root.querySelector('erp-data-table')).not.toBeNull(); expect(root.textContent).toContain('Egypt'); expect(service.page.mock.calls.map(([query]) => query)).toEqual([defaultCountryQuery]);
    expect(root.querySelector('erp-page-header.collection-header')).not.toBeNull();expect(root.querySelectorAll('p-column-filter')).toHaveLength(11);expect(root.querySelector('.reference-grid')).not.toBeNull();
    owner.view.set('cards'); await fixture.whenStable(); expect(root.querySelector('erp-card-list erp-surface-card')).not.toBeNull();
    expect(root.querySelector('.card-heading')?.textContent).toContain('Egypt'); expect(root.textContent).toContain('EGY');
    locale.setLanguage('ar'); await fixture.whenStable(); expect(root.querySelector('.card-heading h2')?.textContent).toBe('مصر');
    expect(service.page).toHaveBeenCalledOnce(); expect(service.detail).not.toHaveBeenCalled();
  });
  it('fetches actual detail and uses six shared readonly inputs without a Save action', async () => {
    const { fixture, owner, service } = await setup(); owner.state.open(1); await fixture.whenStable();
    expect(service.detail).toHaveBeenCalledExactlyOnceWith(1);
    const detail = document.querySelector('erp-country-read-details')!;
    const inputs = Array.from(detail.querySelectorAll<HTMLInputElement>('input'));
    expect(inputs).toHaveLength(6); expect(inputs.every(input => input.readOnly)).toBe(true);
    expect(inputs.map(input => input.value)).toEqual(['مصر', 'Egypt', 'EG', 'EGY', '+20', 'EGP']);
    expect(detail.querySelector('button[type=submit]')).toBeNull(); expect(detail.querySelector('form')?.noValidate).toBe(true);
    Array.from(detail.querySelectorAll<HTMLButtonElement>('button')).find(button => button.textContent?.trim() === 'Close')!.click(); await fixture.whenStable();
    expect(owner.state.detailOpen()).toBe(false); expect(document.querySelector('erp-country-read-details')).toBeNull();
  });
  it('masks all rows/cards/detail and guards old callbacks immediately after permission loss', async () => {
    const { fixture, owner, identity, service, root } = await setup(); owner.view.set('cards'); await fixture.whenStable();
    owner.state.open(1); await fixture.whenStable(); identity.set({ ...sessionFixture });
    expect(owner.state.source().kind).toBe('forbidden'); expect(owner.state.detailOpen()).toBe(false); await fixture.whenStable();
    expect(root.querySelector('erp-surface-card')).toBeNull(); expect(document.querySelector('erp-country-read-details')).toBeNull();
    owner.state.refresh(); owner.state.open(1); await fixture.whenStable(); expect(service.page).toHaveBeenCalledOnce(); expect(service.detail).toHaveBeenCalledOnce();
  });
});
