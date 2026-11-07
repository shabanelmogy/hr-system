import { computed, inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthSession } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import { SystemAuditService } from '../services/system-audit-service';
import { systemAuditAllowed } from '../system-audit-access';
import { AuditReadState } from './audit-read-state';

@Injectable()
export class AuditFilterState {
  private readonly service = inject(SystemAuditService);
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(AuditReadState);
  private readonly scope = computed(() => (this.reads.canRead() ? this.auth.readIdentity() : null));
  private readonly read = createScopedRead(this.scope, systemAuditAllowed, (actor) =>
    this.service.filters().pipe(
      tap({
        error: (error: unknown) => {
          if (
            actor === this.auth.readIdentity() &&
            error instanceof HttpErrorResponse &&
            [401, 403].includes(error.status)
          )
            this.reads.deny(actor);
        },
      }),
    ),
  );
  readonly view = computed(() =>
    this.auth.readIdentity() && !this.reads.canRead()
      ? { kind: 'forbidden' as const }
      : this.read.state(),
  );
  readonly modules = computed(() => {
    const view = this.view();
    return view.kind === 'ready' ? view.data : [];
  });
  refresh(): void {
    this.read.refresh();
  }
}
