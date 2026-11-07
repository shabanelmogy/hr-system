import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { take, throwIfEmpty, type Subscription } from 'rxjs';
import { downloadBlob } from '../../../shared/data/public-api';
import { FeedbackNotifications } from '../../../shared/ui/public-api';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { systemErrorLogExportAllowed } from '../system-error-log-access';
import type { ErrorLogCriteria } from '../types/error-log';
import { ErrorLogReadState } from './error-log-read-state';

@Injectable()
export class ErrorLogExportState {
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(ErrorLogReadState);
  private readonly service = inject(SystemErrorLogService);
  private readonly destroy = inject(DestroyRef);
  private readonly notices = inject(FeedbackNotifications);
  private readonly denied = signal<Session | null>(null);
  private readonly busy = signal(false);
  private readonly failureSnapshot = signal<{
    readonly actor: Session;
    readonly criteria: ErrorLogCriteria;
    readonly error: unknown;
  } | null>(null);
  private operation: Subscription | null = null;
  private operationActor: Session | null = null;
  private operationCriteria: ErrorLogCriteria | null = null;
  private operationSequence = 0;
  readonly allowed = computed(
    () =>
      this.reads.canRead() &&
      systemErrorLogExportAllowed(this.auth.readIdentity()) &&
      this.denied() !== this.auth.readIdentity(),
  );
  readonly pending = this.busy.asReadonly();
  readonly failure = computed(() => {
    const snapshot = this.failureSnapshot();
    return snapshot &&
      snapshot.actor === this.auth.readIdentity() &&
      snapshot.criteria === this.reads.criteria()
      ? snapshot.error
      : null;
  });
  constructor() {
    this.destroy.onDestroy(() => this.operation?.unsubscribe());
    effect(() => {
      const actor = this.auth.readIdentity(),
        criteria = this.reads.criteria();
      const failure = this.failureSnapshot();
      if (failure && (actor !== failure.actor || criteria !== failure.criteria))
        this.failureSnapshot.set(null);
      if (this.operation && (actor !== this.operationActor || criteria !== this.operationCriteria))
        untracked(() => this.cancel());
    });
  }
  request(): void {
    const actor = this.auth.readIdentity(),
      criteria = this.reads.criteria();
    if (this.busy() && (actor !== this.operationActor || criteria !== this.operationCriteria))
      this.cancel();
    if (!actor || !this.allowed() || !criteria || this.busy()) return;
    this.busy.set(true);
    this.failureSnapshot.set(null);
    const sequence = ++this.operationSequence;
    this.operationActor = actor;
    this.operationCriteria = criteria;
    this.operation = this.service
      .exportXlsx(criteria)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: (result) => {
          if (this.current(sequence, actor, criteria)) {
            downloadBlob(result.blob, result.fileName);
            this.notices.success('errorLogs.exported', 'platform-advanced-tools');
          }
          this.complete(sequence);
        },
        error: (error: unknown) => {
          if (!this.current(sequence, actor, criteria)) return;
          if (error instanceof HttpErrorResponse && error.status === 401) this.reads.deny(actor);
          if (error instanceof HttpErrorResponse && error.status === 403) this.denied.set(actor);
          this.failureSnapshot.set({ actor, criteria, error });
          this.complete(sequence);
        },
      });
  }
  private cancel(): void {
    this.operationSequence++;
    this.operation?.unsubscribe();
    this.operation = null;
    this.operationActor = null;
    this.operationCriteria = null;
    this.busy.set(false);
  }
  private current(sequence: number, actor: Session, criteria: ErrorLogCriteria): boolean {
    return (
      !this.destroy.destroyed &&
      sequence === this.operationSequence &&
      actor === this.auth.readIdentity() &&
      criteria === this.reads.criteria() &&
      this.allowed()
    );
  }
  private complete(sequence: number): void {
    if (sequence !== this.operationSequence) return;
    this.operation = null;
    this.operationActor = null;
    this.operationCriteria = null;
    this.busy.set(false);
  }
}
