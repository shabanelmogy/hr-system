import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { createScopedRead } from '../../../../../shared/data/public-api';
import type {
  ReferenceOption,
  ReferenceSelection,
  ReferenceSource,
} from '../../../../../shared/ui/public-api';
import { CountryLookupService, type CountryLookup } from '../../countries/lookup.public-api';
import { stateReadAllowed } from '../types/state';

/** The active parent lookup has its own grant and actor-scoped read lifetime. */
@Injectable()
export class StateCountriesState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(CountryLookupService);
  private readonly locale = inject(LocalizationRuntime);
  private readonly identity = computed(() => this.auth.readIdentity());
  private readonly actorKeys = new WeakMap<Session, number>();
  private sequence = 0;
  private readonly search = signal('');
  readonly searchText = this.search.asReadonly();
  private readonly allowed = (actor: Session) =>
    stateReadAllowed(actor) && actor.permissions.includes('Countries:View');
  private readonly read = createScopedRead(this.identity, this.allowed, () =>
    this.service.lookup(),
  );
  readonly view = computed(() => {
    const actor = this.identity();
    if (!actor) return { kind: 'loading' as const };
    return this.allowed(actor) ? this.read.state() : { kind: 'forbidden' as const };
  });
  private readonly scope = computed(() => {
    const actor = this.identity();
    if (!actor) return 'state-countries:anonymous';
    let key = this.actorKeys.get(actor);
    if (key === undefined) {
      key = ++this.sequence;
      this.actorKeys.set(actor, key);
    }
    return 'state-countries:' + key;
  });
  readonly source = computed<ReferenceSource>(() => {
    const query = { scopeKey: this.scope(), search: this.search() };
    const view = this.view();
    if (view.kind !== 'ready') return { query, kind: view.kind };
    const term = this.search().trim().normalize('NFC').toLocaleLowerCase('en-US');
    const options = view.data
      .filter((country) =>
        [country.nameAr, country.nameEn].some((name) =>
          name.normalize('NFC').toLocaleLowerCase('en-US').includes(term),
        ),
      )
      .map((country) => this.option(country));
    return { query, kind: 'ready', result: { query, options, hasMore: false } };
  });
  private readonly refreshRequested = signal<Session | null>(null);
  constructor() {
    effect(() => {
      const actor = this.identity();
      const requested = this.refreshRequested();
      const state = this.read.state();
      if (
        actor &&
        actor === requested &&
        !this.read.pending() &&
        (state.kind === 'ready' || state.kind === 'error')
      ) {
        this.refreshRequested.set(null);
        untracked(() => this.read.refreshInBackground());
      }
    });
  }
  invalidate(): void {
    const actor = this.identity();
    if (actor && this.allowed(actor) && this.read.state().kind !== 'forbidden')
      this.refreshRequested.set(actor);
  }

  changeSearch(value: unknown): void {
    const actor = this.identity();
    if (actor && this.allowed(actor) && typeof value === 'string' && value.length <= 200)
      this.search.set(value);
  }
  refresh(): void {
    this.read.refresh();
  }
  canSelect(value: number | null): boolean {
    const view = this.view();
    return (
      value !== null &&
      view.kind === 'ready' &&
      view.data.some((country) => country.id === value && !country.isDeleted)
    );
  }
  selection(value: number | null, retained?: CountryLookup): ReferenceSelection | null {
    if (value === null || !Number.isSafeInteger(value) || value < 1) return null;
    const scopeKey = this.scope();
    const view = this.view();
    if (view.kind === 'loading') return { scopeKey, value, kind: 'loading' };
    if (view.kind === 'forbidden') return { scopeKey, value, kind: 'missing' };
    if (view.kind === 'error') return { scopeKey, value, kind: 'error' };
    const country = view.data.find((item) => item.id === value);
    if (country) return { scopeKey, value, kind: 'ready', option: this.option(country) };
    if (retained?.id === value)
      return {
        scopeKey,
        value,
        kind: 'ready',
        option: { ...this.option(retained), disabled: true },
      };
    return { scopeKey, value, kind: 'missing' };
  }
  private option(country: CountryLookup): ReferenceOption {
    return {
      value: country.id,
      label: this.locale.language().toLowerCase().startsWith('ar')
        ? country.nameAr
        : country.nameEn,
      ...(country.isDeleted ? { disabled: true } : {}),
    };
  }
}
