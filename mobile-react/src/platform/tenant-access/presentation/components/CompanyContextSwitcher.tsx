import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/platform/auth';
import {
  AppButton,
  AppCard,
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

export function CompanyContextSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { language, direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session, switchCompany, isSwitchingCompany } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [pendingDiscardCompanyId, setPendingDiscardCompanyId] = useState<number | null>(null);
  const isSuperAdmin = session?.roles.some(
    (role) => role.trim().toLowerCase() === 'super_admin',
  ) ?? false;
  const companies = session?.companies ?? [];
  const canSwitch = companies.length > 1;
  const currentName = companyName(
    session?.companyNameAr ?? '',
    session?.companyNameEn ?? '',
    session?.companyCode ?? '',
    language === 'ar',
  );

  if (!session || isSuperAdmin || !currentName) return null;

  const open = () => {
    if (!canSwitch || isSwitchingCompany) return;
    setSelectedCompanyId(session.companyId);
    setVisible(true);
  };
  const close = () => {
    if (!isSwitchingCompany) setVisible(false);
  };
  const performSwitch = async (companyId: number) => {
    try {
      await switchCompany(companyId);
      setVisible(false);
      showToast.success(t('auth.companySwitched'));
    } catch (error) {
      showToast.error(error, t('auth.companySwitchFailed'));
    }
  };
  const confirm = async () => {
    if (!selectedCompanyId || selectedCompanyId === session.companyId) return;
    if (hasUnsavedChanges()) {
      setPendingDiscardCompanyId(selectedCompanyId);
      return;
    }
    await performSwitch(selectedCompanyId);
  };
  const confirmDiscardAndSwitch = async () => {
    if (!pendingDiscardCompanyId) return;
    const companyId = pendingDiscardCompanyId;
    discardUnsavedChanges();
    setPendingDiscardCompanyId(null);
    await performSwitch(companyId);
  };

  return (
    <>
      <Pressable
        accessibilityHint={canSwitch ? t('auth.switchCompany') : undefined}
        accessibilityLabel={`${t('auth.currentCompany')}: ${currentName}`}
        accessibilityRole={canSwitch ? 'button' : 'text'}
        disabled={!canSwitch || isSwitchingCompany}
        onPress={open}
        style={({ pressed }) => [
          styles.badge,
          compact ? styles.compactBadge : null,
          {
            direction,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
            opacity: pressed ? 0.78 : 1,
          },
        ]}>
        <AppIcon color={theme.colors.primary} name="business-outline" size={16} />
        <AppText
          numberOfLines={1}
          style={[styles.badgeLabel, { color: theme.colors.text }]}
          variant="caption"
          weight="800">
          {currentName}
        </AppText>
        {canSwitch ? (
          <AppIcon color={theme.colors.textMuted} name="chevron-down" size={15} />
        ) : null}
      </Pressable>

      <AppModal
        closeDisabled={isSwitchingCompany}
        closeLabel={t('common.cancel')}
        footer={
          <View style={[styles.actions, { direction }]}>
            <AppButton
              disabled={isSwitchingCompany}
              onPress={close}
              style={styles.action}
              variant="ghost">
              {t('common.cancel')}
            </AppButton>
            <AppButton
              disabled={selectedCompanyId === null || selectedCompanyId === session.companyId}
              icon={isRTL ? 'swap-horizontal-outline' : 'swap-horizontal-outline'}
              loading={isSwitchingCompany}
              onPress={() => void confirm()}
              style={styles.action}>
              {t('auth.switchCompany')}
            </AppButton>
          </View>
        }
        icon="business-outline"
        onClose={close}
        subtitle={t('auth.switchCompanyDescription')}
        title={t('auth.switchCompany')}
        visible={visible}>
        <View style={styles.companyList}>
          {companies.map((company) => {
            const selected = company.id === selectedCompanyId;
            const name = companyName(
              company.nameAr,
              company.nameEn,
              company.companyCode,
              language === 'ar',
            );
            return (
              <AppCard
                accessibilityLabel={name}
                accessibilityState={{ selected, disabled: isSwitchingCompany }}
                disabled={isSwitchingCompany}
                key={company.id}
                onPress={() => setSelectedCompanyId(company.id)}
                padding="md"
                style={[
                  styles.company,
                  {
                    direction,
                    backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.background,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppIcon color={theme.colors.primary} name="business-outline" size={22} />
                <View style={styles.companyText}>
                  <AppText numberOfLines={1} variant="label">{name}</AppText>
                  <AppText color="muted" variant="caption">{company.companyCode}</AppText>
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
        confirmLabel={t('auth.switchCompany')}
        description={t('auth.switchCompanyUnsavedDescription')}
        loading={isSwitchingCompany}
        onCancel={() => setPendingDiscardCompanyId(null)}
        onConfirm={() => void confirmDiscardAndSwitch()}
        title={t('auth.switchCompanyUnsavedTitle')}
        tone="warning"
        visible={pendingDiscardCompanyId !== null}
      />
    </>
  );
}

function companyName(nameAr: string, nameEn: string, code: string, isArabic: boolean) {
  return (isArabic ? nameAr : nameEn).trim() ||
    (isArabic ? nameEn : nameAr).trim() ||
    code.trim();
}

const styles = StyleSheet.create({
  badge: {
    maxWidth: 210,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
  },
  compactBadge: {
    maxWidth: 116,
  },
  badgeLabel: {
    flexShrink: 1,
  },
  companyList: {
    gap: 10,
  },
  company: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  companyText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  action: {
    minWidth: 116,
  },
});
