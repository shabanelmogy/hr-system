import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { offlineScopeKey, type OfflineScope } from '@/src/core/offline';
import {
  canExecuteOfflineCommand as resolvedCanExecuteOfflineCommand,
  canReadOffline as resolvedCanReadOffline,
  canSaveDraft as resolvedCanSaveDraft,
  type OfflineOperationMode,
  type ResolvedOfflineCapability,
} from '@/src/core/offline-policy';

import type {
  OfflineOperationsPolicyState,
  ServerOfflineOperationsPolicySnapshot,
} from '../../domain/models/offline-operations-policy';
import { useOfflineOperationsComposition } from '../../composition/use-offline-operations-composition';

interface OfflineOperationsContextValue {
  readonly loaded: boolean;
  readonly scope: OfflineScope | null;
  readonly snapshot: ServerOfflineOperationsPolicySnapshot | null;
  readonly policy: OfflineOperationsPolicyState | null;
  readonly savingCapabilityId: string | null;
  readonly resolve: (capabilityId: string) => ResolvedOfflineCapability;
  readonly canReadOffline: (capabilityId: string) => boolean;
  readonly canSaveDraft: (capabilityId: string) => boolean;
  readonly canExecuteOfflineCommand: (capabilityId: string) => boolean;
  readonly reload: () => Promise<void>;
  readonly setMode: (capabilityId: string, mode: OfflineOperationMode) => Promise<void>;
  readonly resetScope: () => Promise<void>;
  readonly reset: () => Promise<void>;
}

const OfflineOperationsContext = createContext<OfflineOperationsContextValue | null>(null);

export function OfflineOperationsProvider({ children }: PropsWithChildren) {
  const { scope, useCases } = useOfflineOperationsComposition();
  const scopeKey = scope ? offlineScopeKey(scope) : null;
  const [loadedPolicy, setLoadedPolicy] = useState<{
    readonly key: string;
    readonly policy: OfflineOperationsPolicyState | null;
  } | null>(null);
  const [savingCapabilityId, setSavingCapabilityId] = useState<string | null>(null);
  const loaded = !scopeKey || !useCases || loadedPolicy?.key === scopeKey;
  const policy = loadedPolicy?.key === scopeKey ? loadedPolicy.policy : null;

  const reload = useCallback(async () => {
    if (!scope || !scopeKey || !useCases) return;
    const next = await useCases.load(scope);
    setLoadedPolicy({ key: scopeKey, policy: next });
  }, [scope, scopeKey, useCases]);

  useEffect(() => {
    let active = true;
    if (!scope || !scopeKey || !useCases) return undefined;
    void useCases.load(scope).then((next) => {
      if (!active) return;
      setLoadedPolicy({ key: scopeKey, policy: next });
    }).catch(() => {
      if (!active) return;
      setLoadedPolicy({ key: scopeKey, policy: null });
    });
    return () => {
      active = false;
    };
  }, [scope, scopeKey, useCases]);

  const setMode = useCallback(async (capabilityId: string, mode: OfflineOperationMode) => {
    if (!scope || !useCases) {
      throw new Error('Offline operations policy is unavailable for the current offline scope.');
    }
    setSavingCapabilityId(capabilityId);
    try {
      const next = await useCases.setMode(scope, capabilityId, mode);
      setLoadedPolicy({ key: offlineScopeKey(scope), policy: next });
    } finally {
      setSavingCapabilityId(null);
    }
  }, [scope, useCases]);

  const reset = useCallback(async () => {
    if (!scope || !useCases) {
      throw new Error('Offline operations policy is unavailable for the current offline scope.');
    }
    const next = await useCases.reset(scope);
    setLoadedPolicy({ key: offlineScopeKey(scope), policy: next });
  }, [scope, useCases]);

  const resolve = useCallback((capabilityId: string): ResolvedOfflineCapability => {
    const existing = policy?.resolved[capabilityId];
    if (existing) return existing;
    return Object.freeze({
      capabilityId,
      tenantId: scope?.tenantId ?? '',
      companyId: scope?.companyId ?? 0,
      mode: 'online-only',
      source: 'fail-closed',
    });
  }, [policy, scope]);

  const value = useMemo<OfflineOperationsContextValue>(() => ({
    loaded,
    scope,
    snapshot: policy?.snapshot ?? null,
    policy,
    savingCapabilityId,
    resolve,
    canReadOffline: (capabilityId) => resolvedCanReadOffline(resolve(capabilityId)),
    canSaveDraft: (capabilityId) => resolvedCanSaveDraft(resolve(capabilityId)),
    canExecuteOfflineCommand: (capabilityId) => resolvedCanExecuteOfflineCommand(resolve(capabilityId)),
    reload,
    setMode,
    resetScope: reset,
    reset,
  }), [loaded, policy, reload, reset, resolve, savingCapabilityId, scope, setMode]);

  return (
    <OfflineOperationsContext.Provider value={value}>
      {children}
    </OfflineOperationsContext.Provider>
  );
}

export function useOfflineOperations(): OfflineOperationsContextValue {
  const context = useContext(OfflineOperationsContext);
  if (!context) {
    throw new Error('useOfflineOperations must be used inside OfflineOperationsProvider.');
  }
  return context;
}

export const OfflineOperationsPolicyProvider = OfflineOperationsProvider;
export const useOfflineOperationsPolicy = useOfflineOperations;
