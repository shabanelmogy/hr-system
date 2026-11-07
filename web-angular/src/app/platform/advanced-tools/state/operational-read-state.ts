import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { map, tap, type Observable } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import { AdvancedToolService } from '../services/advanced-tool-service';
import type { HealthReport } from '../types/operational-report';

export type OperationalKind = 'health' | 'hangfire';
type OperationalReport = { type: 'health'; report: HealthReport } | { type: 'hangfire' };
export function operationalAllowed(actor: Session | null, kind: OperationalKind): boolean {
  if (!actor?.userId) return false;
  return kind === 'health'
    ? actor.roles.includes('admin') ||
        (actor.roles.includes('super_admin') && actor.permissions.includes('SystemHealth:View'))
    : actor.permissions.includes('Hangfire:View');
}

/** Each page owns one cancellable read; no polling of health checks or stale actor data. */
@Injectable()
export class OperationalReadState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(AdvancedToolService);
  private readonly denied = signal<Session | null>(null);
  readonly kind = signal<OperationalKind | null>(null);
  readonly canRead = computed(() => {
    const kind = this.kind();
    return (
      kind !== null &&
      operationalAllowed(this.auth.readIdentity(), kind) &&
      this.auth.readIdentity() !== this.denied()
    );
  });
  private readonly scope = computed(() => {
    const actor = this.auth.readIdentity();
    const kind = this.kind();
    return actor && kind ? { actor, kind } : null;
  });
  private deny(scope: { actor: Session }): void {
    if (this.auth.readIdentity() === scope.actor) this.denied.set(scope.actor);
  }
  private readonly read = createScopedRead(
    this.scope,
    (scope) => operationalAllowed(scope.actor, scope.kind) && scope.actor !== this.denied(),
    (scope): Observable<OperationalReport> => {
      const request: Observable<OperationalReport> =
        scope.kind === 'health'
          ? this.service.health().pipe(map((report) => ({ type: 'health', report })))
          : this.service.hangfire().pipe(map(() => ({ type: 'hangfire' })));
      return request.pipe(
        tap({
          error: (error: unknown) => {
            if (error instanceof HttpErrorResponse && [401, 403].includes(error.status))
              this.deny(scope);
          },
        }),
      );
    },
  );
  readonly view = computed(() =>
    !this.canRead() ? { kind: 'forbidden' as const } : this.read.state(),
  );
  readonly pending = this.read.pending;
  refresh(): void {
    if (this.kind() === 'hangfire') this.read.refresh();
    else this.read.refreshInBackground();
  }
  retry(): void {
    this.read.retry();
  }
}
