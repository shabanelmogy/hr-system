import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import { AppButton, AppIcon, AppText } from '@/src/shared/components';

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
    <Modal
      animationType="fade"
      onRequestClose={selectingCompanyId === null ? onCancel : undefined}
      transparent
      visible={selection !== null}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              direction,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}>
          <View style={styles.heading}>
            <AppText variant="titleSmall">{t('auth.selectCompany')}</AppText>
            <AppText color="muted" variant="bodySmall">
              {t('auth.selectCompanyDescription')}
            </AppText>
          </View>

          {error ? (
            <View
              accessibilityLiveRegion="assertive"
              style={[
                styles.error,
                { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger },
              ]}>
              <AppIcon color={theme.colors.danger} name="alert-circle-outline" size={19} />
              <AppText color="danger" style={styles.companyText} variant="bodySmall">
                {error}
              </AppText>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.companyList}>
            {selection?.companies.map((company) => {
              const primaryName = language === 'ar' ? company.nameAr : company.nameEn;
              const secondaryName = language === 'ar' ? company.nameEn : company.nameAr;
              const selected = selectedCompanyId === company.id;

              return (
                <Pressable
                  accessibilityLabel={primaryName}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: selectingCompanyId !== null }}
                  disabled={selectingCompanyId !== null}
                  key={company.id}
                  onPress={() => setSelectedCompany({ token: selectionToken, id: company.id })}
                  style={({ pressed }) => [
                    styles.company,
                    {
                      direction,
                      backgroundColor: selected || pressed
                        ? theme.colors.surfaceMuted
                        : theme.colors.background,
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
                  {selected ? (
                    <AppIcon color={theme.colors.primary} name="checkmark-circle" size={21} />
                  ) : (
                    <AppIcon
                      color={theme.colors.textMuted}
                      name={isRTL ? 'chevron-back' : 'chevron-forward'}
                      size={19}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

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
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    alignSelf: 'center',
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  heading: {
    gap: 4,
  },
  companyList: {
    gap: 10,
  },
  company: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    padding: 10,
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
  error: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStartWidth: 3,
    padding: 9,
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
