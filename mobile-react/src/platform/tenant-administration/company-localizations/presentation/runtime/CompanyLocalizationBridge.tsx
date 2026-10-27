import { useEffect, useLayoutEffect } from 'react';
import { applySystemUiResources, clearSystemUiResources, applyCompanyUiResources, restoreCompanyUiResources } from '@/src/core/localization';
import { useSystemLocalizationRuntime, useCompanyLocalizationRuntime } from '../queries/use-company-localization';

export function CompanyLocalizationBridge() {
  const { runtime, generation, enabled, scope } = useCompanyLocalizationRuntime();
  useEffect(() => {
    const result = runtime.data;
    if (!enabled || runtime.isError) {
      restoreCompanyUiResources(generation);
    } else if (result && result.tenantId === scope.tenantId && result.companyId === scope.companyId) {
      applyCompanyUiResources(result.overrides, result.defaultLanguage, generation);
    }
  }, [enabled, generation, runtime.data, runtime.isError, scope.tenantId, scope.companyId]);
  return <SystemLocalizationBridge/>;
}

function SystemLocalizationBridge(){const {runtime,generation,enabled,signature,permissions}=useSystemLocalizationRuntime();useLayoutEffect(()=>{if(enabled&&runtime.data&&!runtime.isError)applySystemUiResources(runtime.data.overrides,permissions??[],generation);else clearSystemUiResources();return ()=>clearSystemUiResources();},[enabled,generation,runtime.data,runtime.isError,signature,permissions]);return null;}
