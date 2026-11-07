import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import { SystemAuditService } from '../services/system-audit-service';
import { auditKey, type AuditItem } from '../types/audit-trail';
import { systemAuditAllowed } from '../system-audit-access';
import { AuditReadState } from './audit-read-state';

@Injectable()
export class AuditDetailState {
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(AuditReadState);
  private readonly service = inject(SystemAuditService);
  private readonly selection = signal<{ readonly actor: Session; readonly item: AuditItem } | null>(
    null,
  );
  // Presentation outcome only; AuditReadState remains the single authority latch.
  private readonly forbiddenActor = signal<Session | null>(null);
  readonly active = computed(() => {
    const entry = this.selection(),
      actor = this.auth.readIdentity();
    return (
      !!entry &&
      entry.actor === actor &&
      systemAuditAllowed(actor) &&
      (this.forbiddenActor() === actor ||
        (this.reads.canRead() &&
          this.reads.source().result?.rows.some((row) => auditKey(row) === auditKey(entry.item)) ===
            true))
    );
  });
  readonly item = computed(() =>
    this.active() && this.forbiddenActor() !== this.auth.readIdentity()
      ? (this.selection()?.item ?? null)
      : null,
  );
  private readonly scope = computed(() =>
    this.active() && this.reads.canRead() ? this.selection() : null,
  );
  private readonly read = createScopedRead(
    this.scope,
    (entry) => systemAuditAllowed(entry.actor),
    (entry) =>
      this.service.detail({ moduleCode: entry.item.moduleCode, id: entry.item.id }).pipe(
        tap({
          error: (error: unknown) => {
            if (
              this.scope() === entry &&
              error instanceof HttpErrorResponse &&
              [401, 403].includes(error.status)
            ) {
              this.forbiddenActor.set(entry.actor);
              this.reads.deny(entry.actor);
            }
          },
        }),
      ),
  );
  readonly view = computed(() => {
    if (!this.active()) return { kind: 'loading' as const };
    if (this.forbiddenActor() === this.auth.readIdentity()) return { kind: 'forbidden' as const };
    return this.read.state();
  });
  constructor() {
    effect(() => {
      if (this.selection() && !this.active()) untracked(() => this.selection.set(null));
    });
  }
  open(item: AuditItem): void {
    const actor = this.auth.readIdentity();
    if (!actor || !systemAuditAllowed(actor) || this.active() || !this.reads.canRead()) return;
    const current = this.reads
      .source()
      .result?.rows.find((row) => auditKey(row) === auditKey(item));
    if (current) this.selection.set({ actor, item: current });
  }
  close(): void {
    this.selection.set(null);
    this.forbiddenActor.set(null);
  }
  retry(): void {
    if (this.view().kind === 'error') this.read.retry();
  }
}
