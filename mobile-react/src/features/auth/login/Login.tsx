import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { CompanySelectionDialog } from '@/src/features/auth/login/components/CompanySelectionDialog';
import { LeftPanel } from '@/src/features/auth/login/components/LeftPanel';
import { LoginForm } from '@/src/features/auth/login/components/LoginForm';
import { useLoginForm } from '@/src/features/auth/login/hooks/useLoginForm';
import { AppCard } from '@/src/shared/components';

export function Login() {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const form = useLoginForm();

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        alwaysBounceVertical={false}
        bottomOffset={16}
        contentContainerStyle={[styles.body, { direction }]}
        extraKeyboardSpace={12}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        showsVerticalScrollIndicator={false}>
        <AppCard
          style={[
            styles.shell,
            {
              borderRadius: 18,
              flexDirection: isWide ? 'row' : 'column',
              shadowColor: theme.colors.primary,
            },
          ]}>
          {isWide ? <LeftPanel /> : null}
          <LoginForm compact={!isWide} form={form} />
        </AppCard>
      </KeyboardAwareScrollView>

      <CompanySelectionDialog
        error={form.serverError}
        onCancel={form.cancelCompanySelection}
        onSelect={form.selectCompany}
        selection={form.companySelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  shell: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    overflow: 'hidden',
    padding: 0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
});
