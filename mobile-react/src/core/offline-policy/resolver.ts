import { getOfflineCapabilityDefinition } from './capabilities';
import type {
  OfflineCapabilityDefinition,
  OfflineOperationMode,
  OfflinePolicyOverrideSnapshot,
  OfflinePolicyScope,
  ResolveOfflineCapabilityRequest,
  ResolvedOfflineCapability,
} from './types';

const FAIL_CLOSED_MODE: OfflineOperationMode = 'online-only';

export function createOfflinePolicyOverrideSnapshot(
  scope: OfflinePolicyScope,
  modes: Readonly<Record<string, OfflineOperationMode>>,
): OfflinePolicyOverrideSnapshot {
  return Object.freeze({
    tenantId: scope.tenantId,
    companyId: scope.companyId,
    modes: Object.freeze({ ...modes }),
  });
}

export function resolveOfflineCapability(
  request: ResolveOfflineCapabilityRequest,
): ResolvedOfflineCapability {
  const definition = getOfflineCapabilityDefinition(request.capabilityId);
  if (!definition || !isValidScope(request)) {
    return failClosed(request);
  }

  const override = resolveScopedOverride(request, definition);
  if (override.kind === 'invalid') {
    return failClosed(request);
  }
  if (override.kind === 'configured') {
    return resolved(request, override.mode, 'override');
  }

  if (!definition.supportedModes.includes(definition.defaultMode)) {
    return failClosed(request);
  }

  return resolved(request, definition.defaultMode, 'default');
}

export function canReadOffline(
  resolved: Pick<ResolvedOfflineCapability, 'mode'>,
): boolean {
  return resolved.mode === 'offline-read'
    || resolved.mode === 'offline-draft'
    || resolved.mode === 'offline-command';
}

export function canSaveDraft(
  resolved: Pick<ResolvedOfflineCapability, 'mode'>,
): boolean {
  return resolved.mode === 'offline-draft' || resolved.mode === 'offline-command';
}

export function canExecuteOfflineCommand(
  resolved: Pick<ResolvedOfflineCapability, 'mode'>,
): boolean {
  return resolved.mode === 'offline-command';
}

function resolveScopedOverride(
  request: ResolveOfflineCapabilityRequest,
  definition: OfflineCapabilityDefinition,
):
  | { readonly kind: 'absent' }
  | { readonly kind: 'configured'; readonly mode: OfflineOperationMode }
  | { readonly kind: 'invalid' } {
  const snapshot = request.overrideSnapshot;
  if (!snapshot) {
    return { kind: 'absent' };
  }
  if (!snapshotMatchesScope(snapshot, request)) {
    return { kind: 'invalid' };
  }

  const configuredMode = snapshot.modes[request.capabilityId];
  if (!configuredMode) {
    return { kind: 'absent' };
  }
  if (!definition.supportedModes.includes(configuredMode)) {
    return { kind: 'invalid' };
  }

  return { kind: 'configured', mode: configuredMode };
}

function snapshotMatchesScope(
  snapshot: OfflinePolicyOverrideSnapshot,
  scope: OfflinePolicyScope,
): boolean {
  return snapshot.tenantId === scope.tenantId && snapshot.companyId === scope.companyId;
}

function isValidScope(scope: OfflinePolicyScope): boolean {
  return scope.tenantId.trim().length > 0
    && Number.isInteger(scope.companyId)
    && scope.companyId > 0;
}

function failClosed(request: ResolveOfflineCapabilityRequest): ResolvedOfflineCapability {
  return resolved(request, FAIL_CLOSED_MODE, 'fail-closed');
}

function resolved(
  request: ResolveOfflineCapabilityRequest,
  mode: OfflineOperationMode,
  source: ResolvedOfflineCapability['source'],
): ResolvedOfflineCapability {
  return Object.freeze({
    capabilityId: request.capabilityId,
    tenantId: request.tenantId,
    companyId: request.companyId,
    mode,
    source,
  });
}
