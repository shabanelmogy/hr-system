import { ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  AppModal,
  AppText,
} from '@/src/shared/components';

interface CompanySelectionDialogProps {
  selection: CompanySelectionResponse | null;
  error?: string | null;
  onCancel: () => void;
  onSelect: (companyId: number) => Promise<void>;
}

export function CompanySelectionDialog({
  selection,
  error,
  onCancel,
  onSelect,
}: CompanySelectionDialogProps) {
  const { t } = useTranslation();
  const { language, direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const [selectingCompanyId, setSelectingCompanyId] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<{ token: string; id: number | null }>({
    token: '',
    id: null,
  });
  const selectionToken = selection?.companySelectionToken ?? '';
  const selectedCompanyId =
    selectedCompany.token === selectionToken
      ? selectedCompany.id
      : (selection?.companies[0]?.id ?? null);

  const handleContinue = async () => {
    if (selectingCompanyId !== null || selectedCompanyId === null) {
      return;
    }

    setSelectingCompanyId(selectedCompanyId);
    try {
      await onSelect(selectedCompanyId);
    } finally {
      setSelectingCompanyId(null);
    }
  };

  return (
    <AppModal
      closeDisabled={selectingCompanyId !== null}
      closeLabel={t('common.cancel')}
      footer={
        <View style={[styles.actions, { direction }]}>
          <AppButton
            disabled={selectingCompanyId !== null}
            onPress={onCancel}
            style={styles.action}
            variant="ghost">
            {t('common.cancel')}
          </AppButton>
          <AppButton
            disabled={selectedCompanyId === null}
            icon={isRTL ? 'arrow-back-circle-outline' : 'arrow-forward-circle-outline'}
            loading={selectingCompanyId !== null}
            onPress={() => void handleContinue()}
            style={styles.action}>
            {t('auth.continueToCompany')}
          </AppButton>
        </View>
      }
      onClose={onCancel}
      subtitle={t('auth.selectCompanyDescription')}
      title={t('auth.selectCompany')}
      visible={selection !== null}>
      {error ? <AppAlert severity="error">{error}</AppAlert> : null}

      <ScrollView contentContainerStyle={styles.companyList}>
        {selection?.companies.map((company) => {
          const primaryName = language === 'ar' ? company.nameAr : company.nameEn;
          const secondaryName = language === 'ar' ? company.nameEn : company.nameAr;
          const selected = selectedCompanyId === company.id;

          return (
            <AppCard
              accessibilityLabel={primaryName}
              accessibilityState={{ selected, disabled: selectingCompanyId !== null }}
              disabled={selectingCompanyId !== null}
              key={company.id}
              onPress={() => setSelectedCompany({ token: selectionToken, id: company.id })}
              padding="md"
              style={[
                styles.company,
                {
                  direction,
                  backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.background,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.radius.sm,
                  opacity:
                    selectingCompanyId !== null && selectingCompanyId !== company.id ? 0.55 : 1,
                },
              ]}>
              <View
                style={[
                  styles.companyIcon,
                  { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                ]}>
                <AppIcon color={theme.colors.primary} name="business-outline" size={22} />
              </View>
              <View style={styles.companyText}>
                <AppText variant="label">{primaryName}</AppText>
                {secondaryName ? (
                  <AppText color="muted" variant="caption">
                    {secondaryName}
                  </AppText>
                ) : null}
              </View>
              <AppIcon
                color={selected ? theme.colors.primary : theme.colors.textMuted}
                name={selected ? 'checkmark-circle' : isRTL ? 'chevron-back' : 'chevron-forward'}
                size={selected ? 21 : 19}
              />
            </AppCard>
          );
        })}
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  companyList: {
    gap: 10,
  },
  company: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  companyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
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
    minWidth: 120,
  },
});
