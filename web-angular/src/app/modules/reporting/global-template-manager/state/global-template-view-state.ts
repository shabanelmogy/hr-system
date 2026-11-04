import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import type { AuthSession } from '../../../../platform/auth/session.public-api';
import { createScopedRead } from '../../../../shared/data/public-api';
import { GlobalTemplateService } from '../services/global-template-service';
import {
  globalTemplateAllowed,
  type GlobalTemplateDatabaseView,
  type GlobalTemplateEntity,
} from '../types/global-template';

type Actor = NonNullable<ReturnType<AuthSession['readIdentity']>>;
interface ViewBinding {
  readonly actor: Actor;
  readonly sourceKey: GlobalTemplateEntity;
}

/** Database metadata lookup; no result rows or report mutations. */
@Injectable()
export class GlobalTemplateViewState {
  private readonly service = inject(GlobalTemplateService);
  private readonly binding = signal<ViewBinding | null>(null);
  readonly criteria = signal({ search: '', page: 1 });
  private readonly revision = signal(0);
  readonly selected = signal<GlobalTemplateDatabaseView | null>(null);
  private readonly request = computed(() => {
    const binding = this.binding();
    return binding ? { binding, ...this.criteria(), revision: this.revision() } : null;
  });
  private readonly read = createScopedRead(
    this.request,
    (request) => globalTemplateAllowed(request.binding.actor, request.binding.sourceKey, 'Create'),
    (request) =>
      this.service.databaseViews(request.binding.sourceKey, request.search, request.page),
  );
  readonly state = this.read.state;
  readonly error = this.read.error;
  private readonly cache = signal<{
    binding: ViewBinding;
    search: string;
    revision: number;
    items: readonly GlobalTemplateDatabaseView[];
    total: number;
  } | null>(null);
  readonly query = computed(() => ({
    scopeKey: JSON.stringify([
      this.binding()?.actor.userId,
      this.binding()?.sourceKey,
      this.revision(),
    ]),
    search: this.criteria().search,
  }));
  readonly items = computed(() => {
    const request = this.request(),
      cache = this.cache();
    return request &&
      cache?.binding === request.binding &&
      cache.search === request.search &&
      cache.revision === request.revision
      ? cache.items
      : [];
  });
  readonly hasMore = computed(
    () => this.state().kind === 'ready' && this.items().length < (this.cache()?.total ?? 0),
  );

  constructor() {
    effect(() => {
      const request = this.request(),
        state = this.state();
      if (!request || state.kind !== 'ready') return;
      const previous = untracked(this.cache);
      const append =
        request.page > 1 &&
        previous?.binding === request.binding &&
        previous.search === request.search &&
        previous.revision === request.revision;
      const unique = new Map((append ? previous.items : []).map((item) => [item.viewName, item]));
      for (const item of state.data.items) unique.set(item.viewName, item);
      this.cache.set({
        binding: request.binding,
        search: request.search,
        revision: request.revision,
        items: [...unique.values()],
        total: state.data.totalCount,
      });
    });
  }
  bind(actor: Actor | null, sourceKey: GlobalTemplateEntity | null): void {
    this.binding.set(actor && sourceKey ? { actor, sourceKey } : null);
    this.criteria.set({ search: '', page: 1 });
    this.selected.set(null);
    this.cache.set(null);
  }
  remember(value: string | null): void {
    const match = untracked(() =>
      this.items().find((item) => item.viewName === value && item.isCompatible),
    );
    this.selected.set(match ?? null);
  }
  search(value: string): void {
    if (value.length <= 200) this.criteria.set({ search: value, page: 1 });
  }
  loadMore(): void {
    if (this.hasMore() && !this.read.pending())
      this.criteria.update((value) => ({ ...value, page: value.page + 1 }));
  }
  refresh(): void {
    this.selected.set(null);
    this.criteria.update((value) => ({ ...value, page: 1 }));
    this.revision.update((value) => value + 1);
  }
}
