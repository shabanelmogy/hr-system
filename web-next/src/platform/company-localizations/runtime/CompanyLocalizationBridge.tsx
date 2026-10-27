"use client";
import { useEffect, useLayoutEffect } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import { applySystemUiResources,clearSystemUiResources,applyCompanyUiResources,clearCompanyUiResources,companyUiGeneration } from "@/lib/localization/companyUiResources";
import { useSystemLocalizationRuntime, useCompanyLocalizationRuntime } from "../hooks/useCompanyLocalization";

type SessionScope = { tenantId?: string; companyId?: number } | null | undefined;
type RuntimeBundle = {
  tenantId: string;
  companyId: number;
  defaultLanguage: "en" | "ar";
  overrides: Parameters<typeof applyCompanyUiResources>[0];
};

/**
 * Applies a runtime bundle only when it still belongs to the selected company.
 * The shared i18n language-change event is intentionally used here: ThemeShell's
 * existing listener updates document direction and its Emotion/MUI direction.
 */
export function reconcileCompanyLocalizationRuntime(
  bundle: RuntimeBundle | undefined,
  failed: boolean,
  scope: SessionScope,
) {
  if (failed) {
    clearCompanyUiResources();
    return;
  }

  if (bundle && bundle.tenantId === scope?.tenantId && bundle.companyId === scope.companyId) {
    applyCompanyUiResources(bundle.overrides, bundle.defaultLanguage, companyUiGeneration());
  }
}

export function CompanyLocalizationBridge() {
  const {user}=useSession();const query=useCompanyLocalizationRuntime();
  const tenantId=user?.tenantId;const companyId=user?.companyId;
  // Authentication owns synchronous scope cleanup. A direction/theme remount
  // must retain this company's bundle or its Arabic default would oscillate.
  useEffect(()=>{
    reconcileCompanyLocalizationRuntime(query.data,query.isError,{tenantId,companyId});
  },[query.data,query.isError,tenantId,companyId]);
  return <SystemLocalizationBridge/>;
}

function SystemLocalizationBridge() {
 const {query,enabled,signature,permissions}=useSystemLocalizationRuntime();
 useLayoutEffect(()=>{
  if(enabled&&query.data&&!query.isError)applySystemUiResources(query.data.overrides,permissions,companyUiGeneration());
  else clearSystemUiResources();
  return ()=>clearSystemUiResources();
 },[enabled,query.data,query.isError,signature,permissions]);
 return null;
}
