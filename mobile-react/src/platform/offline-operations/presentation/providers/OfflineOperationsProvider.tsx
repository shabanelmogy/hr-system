import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { offlineScopeKey, useConnectivity, type OfflineScope } from '@/src/core/offline';
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
import { createOfflinePolicyRequestGuard } from './offline-policy-request-guard';

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
  const connectivity = useConnectivity();
  const scopeKey = scope ? offlineScopeKey(scope) : null;
  const [loadedPolicy, setLoadedPolicy] = useState<{
    readonly key: string;
    readonly policy: OfflineOperationsPolicyState | null;
  } | null>(null);
  const [savingCapabilityId, setSavingCapabilityId] = useState<string | null>(null);
  const requestGuard = useRef(createOfflinePolicyRequestGuard());
  const loaded = !scopeKey || !useCases || loadedPolicy?.key === scopeKey;
  const policy = loadedPolicy?.key === scopeKey ? loadedPolicy.policy : null;

  useEffect(() => {
    requestGuard.current.selectScope(scopeKey);
  }, [scopeKey]);

  const reload = useCallback(async () => {
    if (!scope || !scopeKey || !useCases) return;
    const requestGeneration = requestGuard.current.capture(scopeKey);
    if (requestGeneration === null) return;
    const next = await useCases.load(scope);
    if (!requestGuard.current.isCurrent(scopeKey, requestGeneration)) return;
    setLoadedPolicy({ key: scopeKey, policy: next });
  }, [scope, scopeKey, useCases]);

  useEffect(() => {
    let active = true;
    if (!scope || !scopeKey || !useCases) return undefined;
    const requestGeneration = requestGuard.current.capture(scopeKey);
    if (requestGeneration === null) return undefined;
    void useCases.load(scope).then((next) => {
      if (!active || !requestGuard.current.isCurrent(scopeKey, requestGeneration)) return;
      setLoadedPolicy({ key: scopeKey, policy: next });
    }).catch(() => {
      if (!active || !requestGuard.current.isCurrent(scopeKey, requestGeneration)) return;
      setLoadedPolicy({ key: scopeKey, policy: null });
    });
    return () => {
      active = false;
    };
  }, [scope, scopeKey, useCases]);

  // A cached policy is an expiring authority, even while it remains in memory.
  // Drop it at the deadline and reload when the app returns or connectivity
  // changes, so admission and replay cannot use stale modes.
  useEffect(() => {
    if (!policy?.snapshot?.validUntil) return undefined;
    const remaining = Date.parse(policy.snapshot.validUntil) - Date.now();
    const timer = setTimeout(() => {
      setLoadedPolicy((current) => current?.key === scopeKey ? { key: scopeKey!, policy: null } : current);
    }, Math.max(0, remaining) + 1);
    return () => clearTimeout(timer);
  }, [policy?.snapshot?.validUntil, scopeKey]);

  useEffect(() => {
    const reloadIfActive = () => {
      if (AppState.currentState === 'active' && connectivity.isOnline) void reload();
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reloadIfActive();
    });
    if (connectivity.isOnline && scopeKey && !policy) reloadIfActive();
    return () => subscription.remove();
  }, [connectivity.isOnline, policy, reload, scopeKey]);

  const setMode = useCallback(async (capabilityId: string, mode: OfflineOperationMode) => {
    if (!scope || !useCases) {
      throw new Error('Offline operations policy is unavailable for the current offline scope.');
    }
    setSavingCapabilityId(capabilityId);
    const requestGeneration = requestGuard.current.capture(scopeKey);
    if (requestGeneration === null) return;
    try {
      const next = await useCases.setMode(scope, capabilityId, mode);
      if (!requestGuard.current.isCurrent(scopeKey, requestGeneration)) return;
      setLoadedPolicy({ key: offlineScopeKey(scope), policy: next });
    } finally {
      setSavingCapabilityId(null);
    }
  }, [scope, scopeKey, useCases]);

  const reset = useCallback(async () => {
    if (!scope || !useCases) {
      throw new Error('Offline operations policy is unavailable for the current offline scope.');
    }
    const requestGeneration = requestGuard.current.capture(scopeKey);
    if (requestGeneration === null) return;
    const next = await useCases.reset(scope);
    if (!requestGuard.current.isCurrent(scopeKey, requestGeneration)) return;
    setLoadedPolicy({ key: offlineScopeKey(scope), policy: next });
  }, [scope, scopeKey, useCases]);

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
