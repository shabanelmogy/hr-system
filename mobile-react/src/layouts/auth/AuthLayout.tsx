import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton, AppText } from '@/src/shared/components';

export function AuthLayout({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { direction, language, setLanguage } = useLocalization();
  const { theme, resolvedMode, setMode } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}>
        <View style={[styles.container, { direction }]}>
          <View style={[styles.toolbar, { direction }]}>
            <AppIconButton
              icon="language-outline"
              label={t('auth.changeLanguage')}
              onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            />
            <AppIconButton
              icon={resolvedMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              label={t('auth.changeTheme')}
              onPress={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
            />
          </View>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <AppText align="center" color="primary" variant="titleSmall">
              {t('common.appName')}
            </AppText>
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  body: {
    flexGrow: 1,
    gap: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  content: {
    width: '100%',
  },
});
