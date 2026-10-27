import type { i18n } from "i18next";
import { isAuthorizedSystemUiText } from "@/config/system-ui-text-access";
import { isCompanyUiText } from "@/config/company-ui-text-scope";

export type CompanyUiLanguage = "en" | "ar";
export type CompanyUiOverride = { namespace: string; language: CompanyUiLanguage; key: string; value: string };
type NamespaceResources = { en: Record<string, unknown>; ar: Record<string, unknown> };
const baselines = new Map<i18n, Map<string, NamespaceResources>>();
let overrides: readonly CompanyUiOverride[] = [];
let systemOverrides: readonly CompanyUiOverride[] = [];
let systemPermissions: readonly string[] = [];
let generation = 0;
let fallbackLanguage: CompanyUiLanguage = "en";
const unsafe = new Set(["__proto__", "constructor", "prototype"]);
const clone = <T>(value: T): T => structuredClone(value);

export function explicitUiLanguage(cookieHeader: string): CompanyUiLanguage | null {
  const value = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith("i18next="))?.slice(8);
  return value === "en" || value === "ar" ? value : null;
}
export function getCompanyUiFallbackLanguage(): CompanyUiLanguage { return fallbackLanguage; }
export function companyUiGeneration(): number { return generation; }

function hasLeaf(resource: Record<string, unknown>, key: string): boolean {
  const segments = key.split(".");
  let value: unknown = resource;
  for (const segment of segments) {
    if (unsafe.has(segment) || !value || typeof value !== "object" || !Object.hasOwn(value, segment)) return false;
    value = (value as Record<string, unknown>)[segment];
  }
  return typeof value === "string";
}
function rebuild(instance: i18n, namespace: string, resource: NamespaceResources) {
  for (const language of ["en", "ar"] as const) {
    instance.removeResourceBundle(language, namespace);
    instance.addResourceBundle(language, namespace, clone(resource[language]), true, true);
    for (const entry of systemOverrides) {
      if (entry.namespace === namespace && entry.language === language && isAuthorizedSystemUiText(namespace, entry.key, systemPermissions) && hasLeaf(resource[language], entry.key))
        instance.addResource(language, namespace, entry.key, entry.value);
    }
    for (const entry of overrides) {
      if (entry.namespace === namespace && entry.language === language && isCompanyUiText(namespace, entry.key) && hasLeaf(resource[language], entry.key))
        instance.addResource(language, namespace, entry.key, entry.value);
    }
  }
}
export function registerCompanyUiBaseline(instance: i18n, namespace: string, resources: NamespaceResources) {
  let registered = baselines.get(instance);
  if (!registered) { registered = new Map(); baselines.set(instance, registered); }
  if (!registered.has(namespace)) registered.set(namespace, clone(resources));
  rebuild(instance, namespace, registered.get(namespace)!);
}
function refreshResources() {
  for (const [instance, namespaces] of baselines) {
    for (const [namespace, resources] of namespaces) rebuild(instance, namespace, resources);
    instance.emit("languageChanged", instance.language);
  }
}
function resolveLanguage() {
  const explicit = typeof document === "undefined" ? null : explicitUiLanguage(document.cookie);
  for (const instance of baselines.keys()) void instance.changeLanguage(explicit ?? fallbackLanguage);
}
/** Called synchronously by the auth transition owner before exposing a different scope. */
export function clearCompanyUiResources() {
  generation++;
  overrides = [];
  systemOverrides = [];
  systemPermissions = [];
  fallbackLanguage = "en";
  refreshResources();
  if (typeof document !== "undefined") resolveLanguage();
}
export function applyCompanyUiResources(entries: readonly CompanyUiOverride[], language: CompanyUiLanguage, expectedGeneration: number): boolean {
  if (expectedGeneration !== generation) return false;
  overrides = entries;
  fallbackLanguage = language;
  refreshResources();
  resolveLanguage();
  return true;
}

export function clearSystemUiResources() { systemOverrides=[]; systemPermissions=[]; refreshResources(); }
export function applySystemUiResources(entries: readonly CompanyUiOverride[], permissions: readonly string[], expectedGeneration: number): boolean {
 if(expectedGeneration!==generation)return false;
 systemOverrides=entries;systemPermissions=permissions;refreshResources();return true;
}
