import type { i18n } from 'i18next';
import { en } from './translations/en';
import { ar } from './translations/ar';
import { isAuthorizedSystemUiText } from './system-ui-text-access';
import { isCompanyUiText } from './company-ui-text-scope';

export type CompanyUiLanguage = 'en' | 'ar';
export interface CompanyUiOverride { namespace: string; language: CompanyUiLanguage; key: string; value: string; }
let companyOverrides: readonly CompanyUiOverride[] = [];
let systemOverrides: readonly CompanyUiOverride[] = [];
let systemPermissions: readonly string[] = [];
let generation = 0;
let explicitPreference: CompanyUiLanguage | null = null;
let companyDefault: CompanyUiLanguage = 'en';
let translationInstance: i18n | undefined;
const subscribers = new Set<() => void>();
const baseline = { en, ar };
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const clone = (value: object): Record<string, unknown> => JSON.parse(JSON.stringify(value));
export const companyUiGeneration = () => generation;
export const subscribeCompanyUiGeneration = (listener: () => void) => { subscribers.add(listener); return () => { subscribers.delete(listener); }; };
export const getResolvedCompanyUiLanguage = (): CompanyUiLanguage => explicitPreference ?? companyDefault;
export function registerCompanyUiInstance(instance: i18n) {
  translationInstance = instance;
  void instance.changeLanguage(getResolvedCompanyUiLanguage());
}
export function setExplicitCompanyUiLanguage(language: CompanyUiLanguage | null) {
  explicitPreference = language;
  void translationInstance?.changeLanguage(getResolvedCompanyUiLanguage());
}
function hasLeaf(resources: object, key: string) {
  let current: unknown = resources;
  for (const segment of key.split('.')) {
    if (forbidden.has(segment) || !current || typeof current !== 'object' || !Object.hasOwn(current, segment)) return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === 'string';
}
function restore() {
  if (!translationInstance) return;
  for (const language of ['en','ar'] as const) {
    translationInstance.removeResourceBundle(language,'translation');
    translationInstance.addResourceBundle(language,'translation',clone(baseline[language]),true,true);
    for(const entry of systemOverrides){if(entry.language===language&&entry.namespace==='translation'&&isAuthorizedSystemUiText(entry.namespace,entry.key,systemPermissions)&&hasLeaf(baseline[language],entry.key))translationInstance.addResource(language,'translation',entry.key,entry.value);}
    for(const entry of companyOverrides){if(entry.language===language&&entry.namespace==='translation'&&isCompanyUiText(entry.namespace,entry.key)&&hasLeaf(baseline[language],entry.key))translationInstance.addResource(language,'translation',entry.key,entry.value);}
  }
}
export function clearCompanyUiResources() {
  generation++;
  companyOverrides=[];systemOverrides=[];systemPermissions=[];
  restoreCompanyUiResources(generation);
  subscribers.forEach(listener => listener());
}
export function restoreCompanyUiResources(expectedGeneration: number) {
  if (generation !== expectedGeneration) return false;
  companyDefault = 'en';
  companyOverrides=[];
  restore();
  void translationInstance?.changeLanguage(getResolvedCompanyUiLanguage());
  translationInstance?.emit('languageChanged',translationInstance.language);
  return true;
}
export function applyCompanyUiResources(overrides: readonly CompanyUiOverride[], language: CompanyUiLanguage, expectedGeneration: number) {
  if (generation !== expectedGeneration) return false;
  companyOverrides=overrides;
  restore();
  companyDefault = language;
  void translationInstance?.changeLanguage(getResolvedCompanyUiLanguage());
  translationInstance?.emit('languageChanged',translationInstance.language);
  return true;
}

export function clearSystemUiResources(){systemOverrides=[];systemPermissions=[];restore();translationInstance?.emit('languageChanged',translationInstance.language);}
export function applySystemUiResources(entries:readonly CompanyUiOverride[],permissions:readonly string[],expectedGeneration:number){if(generation!==expectedGeneration)return false;systemOverrides=entries;systemPermissions=permissions;restore();translationInstance?.emit('languageChanged',translationInstance.language);return true;}
