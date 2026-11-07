import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { errorLogSettingsAllowed } from '../system-error-log-access';

/** Singleton counters belong to the authorized actor, independently of log-list access. */
@Injectable()
export class ErrorLogSettingsState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(SystemErrorLogService);
  private readonly denied = signal<Session | null>(null);
  readonly canRead = computed(() => {
    const actor = this.auth.readIdentity();
    return errorLogSettingsAllowed(actor) && actor !== this.denied();
  });
  private readonly scope = computed(() => {
    const actor = this.auth.readIdentity();
    return actor && this.canRead() ? { actor } : null;
  });
  private readonly read = createScopedRead(
    this.scope,
    (scope) => errorLogSettingsAllowed(scope.actor),
    (scope) =>
      this.service.settings().pipe(
        tap({
          error: (error: unknown) => {
            if (
              this.scope() === scope &&
              error instanceof HttpErrorResponse &&
              [401, 403].includes(error.status)
            )
              this.deny(scope.actor);
          },
        }),
      ),
  );
  readonly view = computed(() =>
    this.auth.readIdentity() && !this.canRead()
      ? { kind: 'forbidden' as const }
      : this.read.state(),
  );
  readonly pending = this.read.pending;
  refresh(): void {
    this.read.refreshInBackground();
  }
  retry(): void {
    this.read.retry();
  }
  deny(actor: Session): void {
    if (actor === this.auth.readIdentity()) this.denied.set(actor);
  }
}
