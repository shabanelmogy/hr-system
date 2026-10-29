import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { createInstance, type TOptions } from 'i18next';
import core from '../../../locales/generated/bootstrap.json';
import { namespaceLoaders, uiCatalogVersion } from './catalog.generated';
import { isCompanyUiText } from './text-scope.generated';
import { isAuthorizedSystemUiText } from './system-access.generated';
import { companyRuntimeSchema, systemRuntimeSchema, type LocalizationIdentity, type NamespaceResources, type UiLanguage, type UiOverride } from './localization.types';

const unsafe = new Set(['__proto__', 'constructor', 'prototype']);
const placeholders = (text: string) => JSON.stringify((text.match(/\{\{[^{}]+\}\}|\{\d+(?:[^{}]*)\}|<\/?\d+>/g) ?? []).sort());

@Injectable({ providedIn: 'root' })
export class LocalizationRuntime {
  private readonly document = inject(DOCUMENT);
  private readonly engine = createInstance();
  private readonly baselines = new Map<string, NamespaceResources>();
  private readonly revision = signal(0);
  private readonly selectedLanguage = signal<UiLanguage>('en');
  readonly language = this.selectedLanguage.asReadonly();
  readonly direction = computed(() => this.language() === 'ar' ? 'rtl' : 'ltr');
  private identity: LocalizationIdentity | null = null;
  private explicitLanguage: UiLanguage | null = null;
  private defaultLanguage: UiLanguage = 'en';
  private company: readonly UiOverride[] = [];
  private system: readonly UiOverride[] = [];
  private generation = 0;

  constructor() {
    const preference = this.document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith('i18next='))?.slice(8);
    this.explicitLanguage = preference === 'ar' || preference === 'en' ? preference : null;
    void this.engine.init({ lng: 'en', fallbackLng: 'en', defaultNS: 'core', fallbackNS: 'core', supportedLngs: ['en', 'ar'],
      initAsync: false, keySeparator: false, interpolation: { escapeValue: false }, resources: {} });
    this.register('core', core);
    this.resolveLanguage();
  }

  translate(key: string, namespace = 'core', options: TOptions = {}): string {
    this.revision(); this.language();
    return String(this.engine.t(key, { ...options, ns: namespace, lng: this.language() }));
  }

  register(namespace: string, resources: NamespaceResources): void {
    const existing = this.baselines.get(namespace);
    this.baselines.set(namespace, {
      en: { ...structuredClone(resources.en), ...existing?.en },
      ar: { ...structuredClone(resources.ar), ...existing?.ar },
    });
    this.rebuild(namespace); this.revision.update(value => value + 1);
  }

  async loadNamespace(namespace: keyof typeof namespaceLoaders): Promise<void> {
    this.register(namespace, await namespaceLoaders[namespace]());
  }

  transition(identity: LocalizationIdentity | null): number {
    this.generation++; this.identity = identity ? structuredClone(identity) : null;
    this.company = []; this.system = []; this.defaultLanguage = 'en';
    this.refresh(); this.resolveLanguage();
    return this.generation;
  }

  currentGeneration(): number { return this.generation; }

  applyCompany(value: unknown, generation: number): boolean {
    if (generation !== this.generation || !this.identity || this.identity.roles.includes('super_admin')) return false;
    const bundle = companyRuntimeSchema.parse(value);
    if (bundle.catalogVersion !== uiCatalogVersion || bundle.tenantId !== this.identity.tenantId || bundle.companyId !== this.identity.companyId) return false;
    this.company = bundle.overrides; this.defaultLanguage = bundle.defaultLanguage;
    this.refresh(); this.resolveLanguage(); return true;
  }

  applySystem(value: unknown, generation: number): boolean {
    if (generation !== this.generation || !this.identity?.roles.includes('super_admin')) return false;
    const bundle = systemRuntimeSchema.parse(value);
    if (bundle.catalogVersion !== uiCatalogVersion) return false;
    this.system = bundle.overrides; this.refresh(); return true;
  }

  clearOverrides(generation: number): void {
    if (generation !== this.generation) return;
    this.company = []; this.system = []; this.defaultLanguage = 'en'; this.refresh(); this.resolveLanguage();
  }

  setLanguage(language: UiLanguage | null): void {
    this.explicitLanguage = language;
    this.document.cookie = language ? `i18next=${language}; Path=/; SameSite=Lax; Max-Age=31536000` : 'i18next=; Path=/; Max-Age=0; SameSite=Lax';
    this.resolveLanguage();
  }

  private resolveLanguage(): void {
    const language = this.explicitLanguage ?? this.defaultLanguage;
    void this.engine.changeLanguage(language); this.selectedLanguage.set(language);
    this.document.documentElement.lang = language; this.document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  private refresh(): void {
    for (const namespace of this.baselines.keys()) this.rebuild(namespace);
    this.revision.update(value => value + 1);
  }

  private rebuild(namespace: string): void {
    const baseline = this.baselines.get(namespace)!;
    for (const language of ['en', 'ar'] as const) {
      const resources = { ...baseline[language] };
      for (const [entries, global] of [[this.system, true], [this.company, false]] as const) {
        for (const entry of entries) {
          if (entry.namespace !== namespace || entry.language !== language || entry.key.split('.').some(key => unsafe.has(key)) || !Object.hasOwn(resources, entry.key)) continue;
          if (global ? !isAuthorizedSystemUiText(namespace, entry.key, this.identity?.permissions ?? []) : !isCompanyUiText(namespace, entry.key)) continue;
          if (placeholders(baseline[language][entry.key]) !== placeholders(entry.value)) continue;
          resources[entry.key] = entry.value;
        }
      }
      this.engine.removeResourceBundle(language, namespace); this.engine.addResourceBundle(language, namespace, resources, true, true);
    }
  }
}
