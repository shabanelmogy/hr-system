import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthSession } from '../../auth/session.public-api';
import { tenantWorkspaceAllowed } from '../presentation/module-access';
import { modulePath } from '../presentation/module-registry';
import { ModuleCatalogState } from './module-catalog-state';

export const overviewApplication = '__overview';

@Injectable()
export class ModuleContextState {
  readonly catalog = inject(ModuleCatalogState);
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly navigating = signal(false);
  private readonly failedIdentity = signal<object | null>(null);
  private readonly path = toSignal(this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects),
  ), { initialValue: this.router.url });

  readonly visible = computed(() => tenantWorkspaceAllowed(this.auth.user()));
  readonly busy = computed(() => this.navigating() || this.router.currentNavigation() !== null ||
    this.auth.pending() || this.auth.restoring() || this.auth.contextChanging());
  readonly navigationFailed = computed(() => this.visible() && this.auth.readIdentity() !== null &&
    this.failedIdentity() === this.auth.readIdentity());
  readonly value = computed(() => {
    const state = this.catalog.state();
    if (state.kind !== 'ready') return '';
    const segments = this.router.parseUrl(this.path()).root.children[PRIMARY_OUTLET]?.segments ?? [];
    if (segments[0]?.path !== 'apps') return '';
    if (segments.length === 1) return overviewApplication;
    const code = segments[1].path.toLowerCase();
    return state.modules.some(module => module.code === code) ? code : '';
  });

  clearError(): void { this.failedIdentity.set(null); }

  async select(value: string): Promise<void> {
    const state = this.catalog.state();
    if (!this.visible() || this.busy() || state.kind !== 'ready' || value === this.value()) return;
    if (value !== overviewApplication && !state.modules.some(module => module.code === value)) return;
    const identity = this.auth.readIdentity();
    this.clearError(); this.navigating.set(true);
    try {
      const succeeded = await this.router.navigateByUrl(value === overviewApplication ? '/apps' : modulePath(value));
      if (!succeeded && this.auth.readIdentity() === identity) this.failedIdentity.set(identity);
    } catch { if (this.auth.readIdentity() === identity) this.failedIdentity.set(identity); }
    finally { this.navigating.set(false); }
  }
}
