import type { SQLiteDatabase } from 'expo-sqlite';

import {
  ScopedRecordStore,
  type OfflineScope,
} from '@/src/core/offline';
import { secureSession } from '@/src/core/storage/secure-storage';
import type { SessionResponse } from '../../domain/models/auth';

const NAMESPACE = 'auth.session-lease';
const KEY = 'current';
const VERSION = 1;
const MAX_LEASE_MS = 24 * 60 * 60 * 1_000;

interface SessionLease {
  version: typeof VERSION;
  scope: OfflineScope;
  validatedAt: string;
  validUntil: string;
  session: SessionResponse;
}

interface SessionPointer {
  version: typeof VERSION;
  scope: OfflineScope;
  validUntil: string;
}

export interface OfflineSessionLeaseSnapshot {
  readonly session: SessionResponse;
  readonly validUntil: string;
}

export async function saveOfflineSessionLease(
  database: SQLiteDatabase | null,
  session: SessionResponse,
): Promise<string | null> {
  if (!database) return null;
  try {
    const scope = scopeFromSession(session);
    const now = Date.now();
    const lease: SessionLease = {
      version: VERSION,
      scope,
      validatedAt: new Date(now).toISOString(),
      validUntil: new Date(now + MAX_LEASE_MS).toISOString(),
      session,
    };
    await new ScopedRecordStore(database).put({
      scope,
      namespace: NAMESPACE,
      key: KEY,
      value: lease,
    });
    await secureSession.setOfflineSessionPointer(JSON.stringify({
      version: VERSION,
      scope,
      validUntil: lease.validUntil,
    } satisfies SessionPointer));
    return lease.validUntil;
  } catch {
    // Server authentication remains authoritative when local persistence is
    // unavailable; the next successful validation can try again.
    return null;
  }
}

export async function loadOfflineSessionLease(
  database: SQLiteDatabase | null,
): Promise<SessionResponse | null> {
  const snapshot = await loadOfflineSessionLeaseSnapshot(database);
  return snapshot?.session ?? null;
}

export async function loadOfflineSessionLeaseSnapshot(
  database: SQLiteDatabase | null,
): Promise<OfflineSessionLeaseSnapshot | null> {
  if (!database) return null;
  try {
    const rawPointer = await secureSession.getOfflineSessionPointer();
    const pointer = parsePointer(rawPointer);
    if (!pointer || Date.parse(pointer.validUntil) <= Date.now()) {
      await invalidateOfflineSessionLease();
      return null;
    }

    const record = await new ScopedRecordStore(database).get<SessionLease>(
      pointer.scope,
      NAMESPACE,
      KEY,
    );
    const lease = record?.value;
    if (!lease || !isValidLease(lease, pointer.scope, pointer.validUntil)) {
      await invalidateOfflineSessionLease();
      return null;
    }
    return { session: lease.session, validUntil: lease.validUntil };
  } catch {
    return null;
  }
}

export async function invalidateOfflineSessionLease(): Promise<void> {
  try {
    await secureSession.clearOfflineSessionPointer?.();
  } catch {
    // Sign-out still clears network credentials even if the optional pointer
    // cannot be removed in a transient keychain failure.
  }
}

export async function invalidateOfflineSessionLeaseSnapshot(
  session: SessionResponse,
  validUntil: string,
): Promise<void> {
  try {
    const pointer = parsePointer(await secureSession.getOfflineSessionPointer());
    if (pointer && pointer.validUntil === validUntil && sameScope(pointer.scope, scopeFromSession(session))) {
      await secureSession.clearOfflineSessionPointer?.();
    }
  } catch {
    // A superseded authentication transition must not fail the active one.
  }
}

export function scopeFromSession(session: SessionResponse): OfflineScope {
  return { userId: session.userId, tenantId: session.tenantId, companyId: session.companyId };
}

function parsePointer(value: string | null): SessionPointer | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SessionPointer>;
    if (parsed.version !== VERSION || typeof parsed.validUntil !== 'string' || !parsed.scope) return null;
    if (typeof parsed.scope.userId !== 'string' || typeof parsed.scope.tenantId !== 'string'
      || !Number.isInteger(parsed.scope.companyId) || parsed.scope.companyId <= 0) return null;
    return parsed as SessionPointer;
  } catch {
    return null;
  }
}

function isValidLease(value: SessionLease, pointerScope: OfflineScope, pointerValidUntil: string): boolean {
  if (value.version !== VERSION || !sameScope(value.scope, pointerScope)) return false;
  const validatedAt = Date.parse(value.validatedAt);
  const validUntil = Date.parse(value.validUntil);
  if (!Number.isFinite(validatedAt) || !Number.isFinite(validUntil)
    || validatedAt > Date.now() || validUntil <= Date.now()
    || validUntil - validatedAt > MAX_LEASE_MS
    || value.validUntil !== pointerValidUntil) return false;
  const session = value.session;
  const companiesValid = Array.isArray(session.companies)
    && session.companies.every((company) => Number.isInteger(company.id)
      && typeof company.companyCode === 'string'
      && typeof company.nameAr === 'string'
      && typeof company.nameEn === 'string');
  return Boolean(session && requiredSessionStrings(session)
    && session.userId === pointerScope.userId
    && session.tenantId === pointerScope.tenantId
    && session.companyId === pointerScope.companyId
    && Array.isArray(session.roles)
    && Array.isArray(session.permissions)
    && session.roles.every((role) => typeof role === 'string')
    && session.permissions.every((permission) => typeof permission === 'string')
    && companiesValid);
}

function requiredSessionStrings(session: SessionResponse): boolean {
  return [session.userId, session.tenantId, session.tenantName, session.tenantPlanName,
    session.companyCode, session.companyNameAr, session.companyNameEn, session.userName,
    session.email, session.firstName, session.lastName, session.tenantSubscriptionStatus]
    .every((value) => typeof value === 'string' && value.trim().length > 0);
}

function sameScope(left: OfflineScope, right: OfflineScope): boolean {
  return left.userId === right.userId && left.tenantId === right.tenantId && left.companyId === right.companyId;
}
