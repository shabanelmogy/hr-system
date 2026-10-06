import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/platform/auth';
import {
  AppButton,
  AppCard,
  AppContextBadge,
  type AppContextBadgeProps,
  AppIcon,
  AppModal,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import {
  discardUnsavedChanges,
  hasUnsavedChanges,
} from '@/src/shared/contexts/unsaved-changes-registry';
import type { FiscalYearLookup } from '../../domain/models/fiscal-year';
import {
  useFiscalYearContext,
  useUpdateFiscalYearContext,
} from '../queries/use-fiscal-years';

export function FiscalYearContextSwitcher({
  compact = false,
  tone = 'surface',
}: {
  compact?: boolean;
  tone?: AppContextBadgeProps['tone'];
}) {
  const { t } = useTranslation();
  const { language, direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { allowed: canView } = useAuthorization({
    requiredPermissions: [permissions.ViewFiscalYears],
  });
  const context = useFiscalYearContext(canView);
  const updateContext = useUpdateFiscalYearContext();
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pendingDiscardId, setPendingDiscardId] = useState<number | null>(null);
  const isArabic = language === 'ar';
  const current = context.data?.selectedFiscalYear ?? null;
  const years = context.data?.availableFiscalYears ?? [];
  const busy = context.isLoading || updateContext.isPending;
  const canOpen = !busy && years.length > 0 && (years.length > 1 || current === null);
  const iconOnly = compact && width < 900;

  if (!canView) return null;

  const open = () => {
    if (!canOpen) return;
    setSelectedId(current?.id ?? null);
    setVisible(true);
  };
  const close = () => {
    if (!updateContext.isPending) setVisible(false);
  };
  const performSwitch = async (fiscalYearId: number) => {
    try {
      const result = await updateContext.mutateAsync(fiscalYearId);
      setVisible(false);
      showToast.success(t('fiscalYears.context.switchSuccess', {
        fiscalYear: result.selectedFiscalYear
          ? fiscalYearName(result.selectedFiscalYear, isArabic)
          : '',
      }));
    } catch (error) {
      showToast.error(error, t('fiscalYears.context.switchError'));
    }
  };
  const confirm = async () => {
    if (!selectedId || selectedId === current?.id) return;
    if (hasUnsavedChanges()) {
      setPendingDiscardId(selectedId);
      return;
    }
    await performSwitch(selectedId);
  };
  const confirmDiscardAndSwitch = async () => {
    if (!pendingDiscardId) return;
    const fiscalYearId = pendingDiscardId;
    discardUnsavedChanges();
    setPendingDiscardId(null);
    await performSwitch(fiscalYearId);
  };
  const label = context.isError
    ? t('fiscalYears.context.loadError')
    : current
      ? fiscalYearName(current, isArabic)
      : t('fiscalYears.context.noSelection');

  return (
    <>
      <AppContextBadge
        accent="warning"
        compact={compact}
        disabled={context.isError || years.length === 0}
        error={context.isError}
        expandable={canOpen}
        icon="calendar-outline"
        iconOnly={iconOnly}
        label={t('fiscalYears.context.label')}
        loading={busy}
        onPress={canOpen ? open : undefined}
        tone={tone}
        value={label}
      />

      <AppModal
        closeDisabled={updateContext.isPending}
        closeLabel={t('common.cancel')}
        footer={
          <View style={[styles.actions, { direction }]}>
            <AppButton disabled={updateContext.isPending} onPress={close} style={styles.action} variant="ghost">
              {t('common.cancel')}
            </AppButton>
            <AppButton
              disabled={selectedId === null || selectedId === current?.id}
              icon="swap-horizontal-outline"
              loading={updateContext.isPending}
              onPress={() => void confirm()}
              style={styles.action}>
              {t('fiscalYears.context.apply')}
            </AppButton>
          </View>
        }
        icon="calendar-outline"
        onClose={close}
        subtitle={t('fiscalYears.context.description')}
        title={t('fiscalYears.context.menuLabel')}
        visible={visible}>
        <View style={styles.yearList}>
          {years.map((fiscalYear) => {
            const selected = fiscalYear.id === selectedId;
            const name = fiscalYearName(fiscalYear, isArabic);
            return (
              <AppCard
                accessibilityLabel={name}
                accessibilityState={{ selected, disabled: updateContext.isPending }}
                disabled={updateContext.isPending}
                key={fiscalYear.id}
                onPress={() => setSelectedId(fiscalYear.id)}
                padding="md"
                style={[
                  styles.year,
                  {
                    direction,
                    backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.background,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppIcon color={fiscalYear.isCurrent ? theme.colors.warning : theme.colors.primary} name={fiscalYear.isCurrent ? 'star' : 'calendar-outline'} size={22} />
                <View style={styles.yearText}>
                  <AppText numberOfLines={1} variant="label">{name}</AppText>
                  <AppText color="muted" variant="caption">
                    {fiscalYear.isCurrent
                      ? t('fiscalYears.context.companyCurrent')
                      : `${fiscalYear.startDate} — ${fiscalYear.endDate}`}
                  </AppText>
                </View>
                <AppIcon
                  color={selected ? theme.colors.primary : theme.colors.textMuted}
                  name={selected ? 'checkmark-circle' : isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={selected ? 21 : 19}
                />
              </AppCard>
            );
          })}
        </View>
      </AppModal>
      <ConfirmationDialog
        confirmLabel={t('fiscalYears.context.apply')}
        description={t('fiscalYears.context.unsavedDescription')}
        loading={updateContext.isPending}
        onCancel={() => setPendingDiscardId(null)}
        onConfirm={() => void confirmDiscardAndSwitch()}
        title={t('fiscalYears.context.unsavedTitle')}
        tone="warning"
        visible={pendingDiscardId !== null}
      />
    </>
  );
}

function fiscalYearName(fiscalYear: FiscalYearLookup, isArabic: boolean) {
  return (isArabic ? fiscalYear.nameAr : fiscalYear.nameEn).trim() ||
    (isArabic ? fiscalYear.nameEn : fiscalYear.nameAr).trim() ||
    fiscalYear.code;
}

const styles = StyleSheet.create({
  yearList: { gap: 10 },
  year: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  yearText: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  action: { minWidth: 116 },
});
