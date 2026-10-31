import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AuthSession, type Session } from '../../../../platform/auth/session.public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { createScopedRead, type PdfDocument } from '../../../../shared/data/public-api';
import { GlobalReportService } from '../services/global-report-service';
import {
  emptyReportFilters,
  globalReportAllowed,
  GlobalReportFailure,
  reportFiltersSchema,
  type GlobalReport,
  type ReportFilters,
} from '../types/global-report';
interface RenderSpec {
  readonly actor: Session;
  readonly report: GlobalReport;
  readonly filters: ReportFilters;
  readonly language: 'en' | 'ar';
  readonly revision: number;
}
type RenderResult =
  | { kind: 'idle'; spec: null }
  | { kind: 'loading'; spec: RenderSpec }
  | { kind: 'ready'; spec: RenderSpec; document: PdfDocument }
  | { kind: 'failure'; spec: RenderSpec; failure: GlobalReportFailure };
export type GlobalReportView =
  | { kind: 'loading' | 'forbidden' | 'empty' | 'conflict' }
  | { kind: 'error'; failure: GlobalReportFailure }
  | { kind: 'ready'; document: PdfDocument; report: GlobalReport };
@Injectable()
export class GlobalReportState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(GlobalReportService);
  private readonly locale = inject(LocalizationRuntime);
  private readonly deniedActor = signal<Session | null>(null);
  private readonly staleActor = signal<Session | null>(null);
  private readonly selection = signal<{actor:Session;id:string} | null>(null);
  private readonly revision = signal(0);
  private readonly criteria = signal<{actor:Session;filters:ReportFilters} | null>(null);
  readonly applied = computed<ReportFilters>(()=>{
    const criteria=this.criteria();return criteria?.actor===this.identity()?criteria.filters:emptyReportFilters;
  });
  private readonly identity = computed(() => {
    const actor = this.auth.readIdentity();
    return actor && actor !== this.deniedActor() ? actor : null;
  });
  private readonly catalogRead = createScopedRead(this.identity, globalReportAllowed, () =>
    this.service.catalog(),
  );
  readonly catalog = this.catalogRead.state;
  readonly selected = computed(() => {
    const state = this.catalog();
    return state.kind === 'ready'
      ? (state.data.find((report) => this.selection()?.actor===this.identity()&&report.id===this.selection()?.id) ?? state.data[0] ?? null)
      : null;
  });
  readonly conflict = computed(() => {
    const actor = this.auth.readIdentity();
    return !!actor && actor === this.staleActor();
  });
  private readonly spec = computed<RenderSpec | null>(() => {
    const actor = this.identity(),
      report = this.selected();
    if (!actor || !globalReportAllowed(actor) || !report || this.conflict()) return null;
    return {
      actor,
      report,
      filters: this.applied(),
      language: this.locale.language() === 'ar' ? 'ar' : 'en',
      revision: this.revision(),
    };
  });
  private readonly result = toSignal(
    toObservable(this.spec).pipe(
      switchMap((spec) => {
        if (!spec) return of<RenderResult>({ kind: 'idle', spec: null });
        return this.service.render(spec.report, spec.filters, spec.language).pipe(
          map((document) => ({ kind: 'ready', spec, document }) satisfies RenderResult),
          catchError((error: unknown) => {
            const failure =
              error instanceof GlobalReportFailure ? error : new GlobalReportFailure('error');
            if (this.spec() === spec) {
              if (failure.kind === 'forbidden') this.deniedActor.set(spec.actor);
              if (failure.kind === 'stale') this.staleActor.set(spec.actor);
            }
            return of<RenderResult>({ kind: 'failure', spec, failure });
          }),
          startWith<RenderResult>({ kind: 'loading', spec }),
        );
      }),
    ),
    { initialValue: { kind: 'idle', spec: null } as RenderResult },
  );
  readonly view = computed<GlobalReportView>(() => {
    const actor = this.auth.readIdentity();
    if (!actor) return { kind: 'loading' };
    if (!globalReportAllowed(actor) || actor === this.deniedActor()) return { kind: 'forbidden' };
    const catalog = this.catalog();
    if (catalog.kind === 'forbidden') return { kind: 'forbidden' };
    if (catalog.kind === 'error')
      return { kind: 'error', failure: new GlobalReportFailure('error') };
    if (catalog.kind === 'loading') return { kind: 'loading' };
    if (!catalog.data.length) return { kind: 'empty' };
    if (this.conflict()) return { kind: 'conflict' };
    const spec = this.spec(),
      result = this.result();
    if (!spec || result.kind === 'idle' || result.spec !== spec || result.kind === 'loading')
      return { kind: 'loading' };
    return result.kind === 'ready'
      ? { kind: 'ready', document: result.document, report: spec.report }
      : { kind: 'error', failure: result.failure };
  });
  readonly pending = computed(() => this.view().kind === 'loading');
  select(id: unknown) {
    const state = this.catalog();
    if (
      typeof id !== 'string' ||
      state.kind !== 'ready' ||
      !state.data.some((report) => report.id === id) ||
      this.selected()?.id === id
    )
      return;
    const actor=this.identity();if(actor)this.selection.set({actor,id});
  }
  search(input: unknown) {
    const parsed = reportFiltersSchema.safeParse(input);
    if (!parsed.success || this.conflict() || !this.spec() || this.pending()) return false;
    const actor=this.identity();if(!actor)return false;
    this.criteria.set({actor,filters:{ ...parsed.data }});
    this.revision.update((n) => n + 1);
    return true;
  }
  reset() {
    return this.search(emptyReportFilters);
  }
  reload() {
    const actor = this.auth.readIdentity();
    if (
      !globalReportAllowed(actor) ||
      actor === this.deniedActor() ||
      this.catalog().kind === 'forbidden'
    )
      return;
    this.staleActor.set(null);
    this.revision.update(value=>value+1);
    this.catalogRead.refresh();
  }
}
