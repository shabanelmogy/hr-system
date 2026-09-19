import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  OfflineOutboxRepository,
  requestOfflineSync,
  useOfflineDatabase,
  type OutboxCommandSummary,
} from '@/src/core/offline';
import { useAuth } from '@/src/platform/auth';
import { useAppTheme } from '@/src/core/theme';
import { AppAlert, AppButton, AppCard, AppStatusBadge, AppText } from '@/src/shared/components';

const ACTIONABLE = new Set(['failed', 'dead-letter']);
const STATUS_KEYS: Record<OutboxCommandSummary['status'], string> = {
  pending: 'offlineOperations.syncCenter.status.pending',
  processing: 'offlineOperations.syncCenter.status.processing',
  succeeded: 'offlineOperations.syncCenter.status.succeeded',
  failed: 'offlineOperations.syncCenter.status.failed',
  conflict: 'offlineOperations.syncCenter.status.conflict',
  uncertain: 'offlineOperations.syncCenter.status.uncertain',
  blocked: 'offlineOperations.syncCenter.status.blocked',
  'dead-letter': 'offlineOperations.syncCenter.status.deadLetter',
};

export function SyncQueuePanel() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const database = useOfflineDatabase();
  const { session } = useAuth();
  const [commands, setCommands] = useState<OutboxCommandSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scope = useMemo(() => session
    ? { userId: session.userId, tenantId: session.tenantId, companyId: session.companyId }
    : null, [session]);

  const reload = useCallback(async () => {
    if (!database || !scope) return;
    setLoading(true);
    setError(null);
    try {
      setCommands(await new OfflineOutboxRepository(database).listSummaries(scope));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('offlineOperations.syncCenter.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [database, scope, t]);

  useEffect(() => {
    const timer = setTimeout(() => { void reload(); }, 0);
    return () => clearTimeout(timer);
  }, [reload]);

  const retry = async (command: OutboxCommandSummary) => {
    if (!database) return;
    const repository = new OfflineOutboxRepository(database);
    const reset = command.status === 'dead-letter'
      ? await repository.resetDeadLetterToPending(command.commandId)
      : await repository.resetFailedToPending(command.commandId);
    if (reset) requestOfflineSync();
    await reload();
  };

  const discard = async (command: OutboxCommandSummary) => {
    if (!database) return;
    await new OfflineOutboxRepository(database).markBlocked(
      command.commandId,
      'The queued command was discarded explicitly from Sync Center.',
    );
    await reload();
  };

  const active = commands.filter((command) => command.status !== 'succeeded' && command.status !== 'blocked');
  return (
    <AppCard>
      <AppText variant="label" weight="700">{t('offlineOperations.syncCenter.title')}</AppText>
      <AppText color="muted" variant="bodySmall">{t('offlineOperations.syncCenter.description')}</AppText>
      {error ? <AppAlert severity="warning">{error}</AppAlert> : null}
      {active.length === 0 && !loading ? <AppAlert severity="info">{t('offlineOperations.syncCenter.empty')}</AppAlert> : null}
      {active.map((command) => (
        <AppCard key={command.commandId} padding="sm" variant="outlined">
          <View style={{ gap: 6 }}>
            <AppText weight="700">{command.commandType}</AppText>
            <AppStatusBadge
              color={command.status === 'conflict' || command.status === 'dead-letter'
                ? theme.colors.danger
                : command.status === 'failed' || command.status === 'uncertain'
                  ? theme.colors.warning
                  : theme.colors.primary}
              label={t(STATUS_KEYS[command.status])}
            />
            {command.lastError ? <AppText color="danger" variant="caption">{sanitizeSyncError(command.lastError)}</AppText> : null}
            {command.nextAttemptAt ? <AppText color="muted" variant="caption">{command.nextAttemptAt}</AppText> : null}
            {ACTIONABLE.has(command.status) ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <AppButton onPress={() => void retry(command)} variant="outline">{t('common.retry')}</AppButton>
                <AppButton onPress={() => void discard(command)} variant="ghost">{t('offlineOperations.syncCenter.discard')}</AppButton>
              </View>
            ) : null}
          </View>
        </AppCard>
      ))}
      <AppButton disabled={loading} loading={loading} onPress={() => void reload()} variant="outline">
        {t('common.refresh')}
      </AppButton>
    </AppCard>
  );
}

function sanitizeSyncError(value: string): string {
  return value
    .replace(/Bearer\s+\S+/gi, '[redacted]')
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[redacted]')
    .slice(0, 240);
}
