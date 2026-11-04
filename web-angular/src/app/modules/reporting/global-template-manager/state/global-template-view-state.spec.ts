import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { GlobalTemplateService } from '../services/global-template-service';
import type { GlobalTemplateDatabaseView } from '../types/global-template';
import { GlobalTemplateViewState } from './global-template-view-state';

describe('database View lookup', () => {
  const actor = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['GlobalCrystalReports:View', 'GlobalCrystalReports:Create', 'Countries:Edit'],
  };
  const first: GlobalTemplateDatabaseView = {
    viewName: 'dbo.vw_First',
    isCompatible: true,
    rejectionCode: null,
  };
  const second: GlobalTemplateDatabaseView = {
    viewName: 'dbo.vw_Second',
    isCompatible: false,
    rejectionCode: 'SchemaBindingRequired',
  };
  function setup() {
    const service = {
      databaseViews: vi.fn<GlobalTemplateService['databaseViews']>(() =>
        of({ items: [first], totalCount: 2 }),
      ),
    };
    TestBed.configureTestingModule({
      providers: [GlobalTemplateViewState, { provide: GlobalTemplateService, useValue: service }],
    });
    const state = TestBed.inject(GlobalTemplateViewState);
    state.bind(actor, 'countries');
    TestBed.tick();
    return { state, service };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('appends pages, preserves selection across search, and clears on refresh', () => {
    const { state, service } = setup();
    expect(state.items()).toEqual([first]);
    state.remember(first.viewName);
    service.databaseViews.mockReturnValue(of({ items: [second], totalCount: 2 }));
    state.loadMore();
    TestBed.tick();
    expect(service.databaseViews).toHaveBeenLastCalledWith('countries', '', 2);
    expect(state.items()).toEqual([first, second]);
    state.search('Second');
    TestBed.tick();
    expect(state.selected()).toEqual(first);
    state.refresh();
    TestBed.tick();
    expect(state.selected()).toBeNull();
  });
  it('does not accept an incompatible choice and clears scoped metadata on identity change', () => {
    const { state, service } = setup();
    service.databaseViews.mockReturnValue(of({ items: [second], totalCount: 1 }));
    state.refresh();
    TestBed.tick();
    state.remember(second.viewName);
    expect(state.selected()).toBeNull();
    state.bind(null, null);
    TestBed.tick();
    expect(state.items()).toEqual([]);
  });
  it('ignores an old search response after another scope replaces it', () => {
    const { state, service } = setup();
    const pending = new Subject<{ items: (typeof first)[]; totalCount: number }>();
    service.databaseViews.mockReturnValue(pending);
    state.search('old');
    TestBed.tick();
    state.bind(null, null);
    TestBed.tick();
    pending.next({ items: [first], totalCount: 1 });
    expect(state.items()).toEqual([]);
  });
  it('exposes database failure and allows explicit metadata refresh', () => {
    const { state, service } = setup();
    service.databaseViews.mockReturnValue(throwError(() => new Error('Unavailable')));
    state.refresh();
    TestBed.tick();
    expect(state.state().kind).toBe('error');
    service.databaseViews.mockReturnValue(of({ items: [], totalCount: 0 }));
    state.refresh();
    TestBed.tick();
    expect(state.state().kind).toBe('ready');
    expect(state.items()).toEqual([]);
  });
});
