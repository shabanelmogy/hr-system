import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  getOfflineCapabilityDefinition,
  OFFLINE_CAPABILITY_IDS,
  OFFLINE_OPERATION_MODES,
  type OfflineOperationMode,
} from '@/src/core/offline-policy';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppSegmentedControl,
  AppStatusBadge,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

import { OfflineOperationsPolicyConflictError } from '../../domain/models/offline-operations-policy';
import { useOfflineOperationsPolicy } from '../providers/OfflineOperationsProvider';
import { SyncQueuePanel } from '../components/SyncQueuePanel';

const modeTranslationKeys: Record<OfflineOperationMode, string> = {
  'online-only': 'offlineOperations.modes.onlineOnly',
  'offline-read': 'offlineOperations.modes.offlineRead',
  'offline-draft': 'offlineOperations.modes.offlineDraft',
  'offline-command': 'offlineOperations.modes.offlineCommand',
};

const capabilityGroups = [
  {
    titleKey: 'offlineOperations.groups.basicData',
    capabilities: [{
      id: OFFLINE_CAPABILITY_IDS.countriesRead,
      titleKey: 'offlineOperations.capabilities.countriesRead',
      descriptionKey: 'offlineOperations.capabilities.countriesReadDescription',
      icon: 'globe-outline' as const,
    }],
  },
  {
    titleKey: 'offlineOperations.groups.workforcePlanning',
    capabilities: [{
      id: OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
      titleKey: 'offlineOperations.capabilities.workforcePlanUpdateDraft',
      descriptionKey: 'offlineOperations.capabilities.workforcePlanUpdateDraftDescription',
      icon: 'briefcase-outline' as const,
    }],
  },
] as const;

export function OfflineOperationsPolicyScreen() {
  return <OfflineOperationsPolicyContent />;
}

function OfflineOperationsPolicyContent() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const {
    loaded,
    scope,
    policy,
    savingCapabilityId,
    reload,
    setMode,
    resetScope,
  } = useOfflineOperationsPolicy();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const [resetPending, setResetPending] = useState(false);
  const hasReadySnapshot = policy?.status === 'ready';
  const hasLiveServerPolicy = hasReadySnapshot && policy?.authority === 'server';

  const updateMode = async (capabilityId: string, mode: OfflineOperationMode) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    try {
      await setMode(capabilityId, mode);
      showToast.success(t('offlineOperations.saveSuccess'));
    } catch (error) {
      if (error instanceof OfflineOperationsPolicyConflictError) {
        await reload();
        showToast.error(error, t('offlineOperations.conflictReloaded'));
        return;
      }
      showToast.error(error, t('offlineOperations.saveFailed'));
    }
  };

  const resetPolicy = async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    try {
      await resetScope();
      setResetPending(false);
      showToast.success(t('offlineOperations.resetSuccess'));
    } catch (error) {
      if (error instanceof OfflineOperationsPolicyConflictError) {
        await reload();
        setResetPending(false);
        showToast.error(error, t('offlineOperations.conflictReloaded'));
        return;
      }
      showToast.error(error, t('offlineOperations.resetFailed'));
    }
  };

  if (!loaded) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppText color="muted">{t('offlineOperations.loading')}</AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <View style={styles.heading}>
        <AppText variant="title">{t('offlineOperations.title')}</AppText>
        <AppText color="muted" variant="bodySmall">{t('offlineOperations.subtitle')}</AppText>
      </View>

      <AppCard style={styles.scopeCard}>
        <View style={[styles.row, { direction }]}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
            <AppIcon color={theme.colors.primary} name="business-outline" size={23} />
          </View>
          <View style={styles.flexText}>
            <AppText variant="label">{t('offlineOperations.scopeTitle')}</AppText>
            <AppText color="muted" variant="bodySmall">{t('offlineOperations.scopeDescription')}</AppText>
            {scope ? (
              <AppText color="muted" variant="caption">
                {t('offlineOperations.scopeValue', {
                  tenantId: scope.tenantId,
                  companyId: scope.companyId,
                })}
              </AppText>
            ) : null}
          </View>
        </View>
        <AppAlert severity="info">{t('offlineOperations.serverCacheNotice')}</AppAlert>
        {policy?.authority === 'cache' ? (
          <AppAlert severity="warning" title={t('offlineOperations.source.cachedPolicy')}>
            {t('offlineOperations.cachedPolicyNotice')}
          </AppAlert>
        ) : null}
      </AppCard>

      {!hasReadySnapshot ? (
        <AppAlert
          severity="warning"
          style={styles.failClosedAlert}
          title={t('offlineOperations.source.failClosed')}>
          {t('offlineOperations.missingSnapshot')}
        </AppAlert>
      ) : null}

      <View style={styles.capabilityGroup}>
        {capabilityGroups.map((group) => (
          <View key={group.titleKey} style={styles.groupSection}>
            <AppText variant="label" weight="700">{t(group.titleKey)}</AppText>
            {group.capabilities.map((card) => {
              const definition = getOfflineCapabilityDefinition(card.id);
              const resolution = policy?.resolved[card.id];
              const mode = resolution?.mode ?? 'online-only';
              const serverDefinition = policy?.snapshot?.capabilities
                .find((capability) => capability.id === card.id);
              const supportedModes = definition?.supportedModes.filter((supportedMode) =>
                serverDefinition?.supportedModes.includes(supportedMode) ?? false) ?? [];
              const isSafetyBlocked = supportedModes.length === 1
                && supportedModes[0] === 'online-only';

              return (
                <AppCard key={card.id} style={styles.capabilityCard}>
                  <View style={[styles.row, { direction }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
                      <AppIcon color={theme.colors.primary} name={card.icon} size={23} />
                    </View>
                    <View style={styles.flexText}>
                      <AppText variant="label">{t(card.titleKey)}</AppText>
                      <AppText color="muted" variant="bodySmall">{t(card.descriptionKey)}</AppText>
                    </View>
                    <AppStatusBadge
                      color={hasReadySnapshot ? theme.colors.primary : theme.colors.warning}
                      label={t(policy?.authority === 'server'
                        ? 'offlineOperations.source.serverPolicy'
                        : policy?.authority === 'cache'
                          ? 'offlineOperations.source.cachedPolicy'
                          : 'offlineOperations.source.failClosed')}
                    />
                  </View>

                  <AppSegmentedControl<OfflineOperationMode>
                    disabled={savingCapabilityId !== null || isReadOnly || !hasLiveServerPolicy}
                    label={t(card.titleKey)}
                    layout="wrap"
                    onChange={(nextMode) => void updateMode(card.id, nextMode)}
                    options={OFFLINE_OPERATION_MODES.map((optionMode) => ({
                      value: optionMode,
                      label: t(modeTranslationKeys[optionMode]),
                      disabled: !supportedModes.includes(optionMode),
                    }))}
                    showLabel={false}
                    value={mode}
                    variant="pill"
                  />

                  {isSafetyBlocked ? (
                    <AppAlert severity="warning" title={t('offlineOperations.safetyBlocked')}>
                      {t('offlineOperations.safetyBlockedDescription')}
                    </AppAlert>
                  ) : null}
                </AppCard>
              );
            })}
          </View>
        ))}
      </View>

      <AppButton
        disabled={savingCapabilityId !== null || isReadOnly || !hasLiveServerPolicy}
        fullWidth
        icon="refresh-circle-outline"
        onPress={() => setResetPending(true)}
        variant="secondary">
        {t('offlineOperations.reset')}
      </AppButton>
      <SyncQueuePanel />
      <ConfirmationDialog
        visible={resetPending}
        title={t('offlineOperations.resetConfirmTitle')}
        description={t('offlineOperations.resetConfirmDescription')}
        confirmLabel={t('offlineOperations.reset')}
        tone="warning"
        onCancel={() => setResetPending(false)}
        onConfirm={resetPolicy}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 4,
    marginBottom: 20,
  },
  scopeCard: {
    gap: 14,
    marginBottom: 14,
  },
  capabilityGroup: {
    gap: 12,
    marginBottom: 16,
  },
  groupSection: {
    gap: 8,
  },
  capabilityCard: {
    gap: 16,
  },
  failClosedAlert: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexText: {
    flex: 1,
    gap: 3,
  },
});
