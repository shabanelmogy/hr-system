import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { CompanySelectionResponse } from '@/src/features/auth/types/auth';
import { AppButton, AppIcon, AppText } from '@/src/shared/components';

interface CompanySelectionModalProps {
  selection: CompanySelectionResponse | null;
  error?: string | null;
  onClose: () => void;
  onSelect: (companyId: number) => Promise<void>;
}

export function CompanySelectionModal({
  selection,
  error,
  onClose,
  onSelect,
}: CompanySelectionModalProps) {
  const { t } = useTranslation();
  const { language, direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const [selectingCompanyId, setSelectingCompanyId] = useState<number | null>(null);

  const handleSelect = async (companyId: number) => {
    if (selectingCompanyId !== null) {
      return;
    }

    setSelectingCompanyId(companyId);
    try {
      await onSelect(companyId);
    } finally {
      setSelectingCompanyId(null);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={selectingCompanyId === null ? onClose : undefined}
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
              const loading = selectingCompanyId === company.id;

              return (
                <Pressable
                  accessibilityLabel={primaryName}
                  accessibilityRole="button"
                  disabled={selectingCompanyId !== null}
                  key={company.id}
                  onPress={() => void handleSelect(company.id)}
                  style={({ pressed }) => [
                    styles.company,
                    {
                      direction,
                      backgroundColor: pressed
                        ? theme.colors.surfaceMuted
                        : theme.colors.background,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.sm,
                      opacity: selectingCompanyId !== null && !loading ? 0.55 : 1,
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
                  {loading ? (
                    <ActivityIndicator color={theme.colors.primary} />
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

          <AppButton
            disabled={selectingCompanyId !== null}
            fullWidth
            onPress={onClose}
            variant="ghost">
            {t('auth.cancelSelection')}
          </AppButton>
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
});
