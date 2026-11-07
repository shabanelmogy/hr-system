import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead, type ReadState } from '../../../shared/data/public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { systemErrorLogDetailsAllowed } from '../system-error-log-access';
import type { ErrorLogDetail, ErrorLogRow } from '../types/error-log';
import { ErrorLogReadState } from './error-log-read-state';

interface DetailScope {
  readonly actor: Session;
  readonly row: ErrorLogRow;
}

@Injectable()
export class ErrorLogDetailState {
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(ErrorLogReadState);
  private readonly service = inject(SystemErrorLogService);
  private readonly selected = signal<DetailScope | null>(null);
  private readonly denied = signal<Session | null>(null);
  readonly active = computed(() => {
    const selected = this.selected(),
      actor = this.auth.readIdentity();
    return (
      !!selected &&
      selected.actor === actor &&
      this.reads.canRead() &&
      systemErrorLogDetailsAllowed(actor) &&
      this.reads.source().result?.rows.some((row) => row.id === selected.row.id) === true
    );
  });
  readonly canOpen = computed(
    () =>
      this.reads.canRead() &&
      systemErrorLogDetailsAllowed(this.auth.readIdentity()) &&
      this.denied() !== this.auth.readIdentity(),
  );
  private readonly scope = computed(() => (this.active() ? this.selected() : null));
  private readonly read = createScopedRead<DetailScope, ErrorLogDetail>(
    this.scope,
    (scope) => systemErrorLogDetailsAllowed(scope.actor),
    (scope) =>
      this.service.detail(scope.row.id).pipe(
        tap({
          error: (error: unknown) => {
            if (this.scope() !== scope || !(error instanceof HttpErrorResponse)) return;
            if (error.status === 401) this.reads.deny(scope.actor);
            if (error.status === 403) this.denied.set(scope.actor);
          },
        }),
      ),
  );
  readonly view = computed<ReadState<ErrorLogDetail>>(() => {
    if (!this.active()) return { kind: 'loading' };
    return this.denied() === this.auth.readIdentity() ? { kind: 'forbidden' } : this.read.state();
  });
  readonly item = computed(() => {
    const view = this.view();
    return view.kind === 'ready' ? view.data : null;
  });
  constructor() {
    effect(() => {
      if (this.selected() && !this.active()) untracked(() => this.selected.set(null));
    });
  }
  open(row: ErrorLogRow): void {
    const actor = this.auth.readIdentity();
    if (!actor || !this.canOpen() || this.active()) return;
    const current = this.reads.source().result?.rows.find((candidate) => candidate.id === row.id);
    if (current) this.selected.set({ actor, row: current });
  }
  close(): void {
    this.selected.set(null);
  }
  retry(): void {
    if (this.view().kind === 'error') this.read.retry();
  }
}
