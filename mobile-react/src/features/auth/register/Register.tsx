import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { PersonalDetailsStep } from '@/src/features/auth/register/components/PersonalDetailsStep';
import { ProfilePictureStep } from '@/src/features/auth/register/components/ProfilePictureStep';
import { SecurityStep } from '@/src/features/auth/register/components/SecurityStep';
import { useRegisterForm } from '@/src/features/auth/register/hooks/useRegisterForm';
import {
  AppCard,
  AppForm,
  AppFormStepActions,
  AppFormStepper,
  AppIcon,
  AppIconButton,
  AppText,
} from '@/src/shared/components';

export function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const form = useRegisterForm();
  const stepFieldNames = useMemo(
    () => [
      ['firstName', 'lastName', 'userName'],
      ['email', 'password', 'confirmPassword'],
      [],
    ] as const,
    [],
  );
  const steps = [
    {
      id: 'personal-details',
      label: t('auth.personalDetails'),
      description: t('auth.personalDetailsDescription'),
      icon: 'person-outline' as const,
      completed: form.activeStep > 0,
      hasError: stepFieldNames[0].some((field) => Boolean(form.errors[field])),
      errorLabel: t('auth.stepHasErrors'),
      content: <PersonalDetailsStep control={form.control} />,
    },
    {
      id: 'account-security',
      label: t('auth.accountSecurity'),
      description: t('auth.accountSecurityDescription'),
      icon: 'lock-closed-outline' as const,
      completed: form.activeStep > 1,
      disabled: form.activeStep < 1,
      hasError: stepFieldNames[1].some((field) => Boolean(form.errors[field])),
      errorLabel: t('auth.stepHasErrors'),
      content: <SecurityStep control={form.control} password={form.password} />,
    },
    {
      id: 'profile-picture',
      label: t('auth.profilePicture'),
      description: t('auth.profilePictureDescription'),
      icon: 'camera-outline' as const,
      disabled: form.activeStep < 2,
      optionalLabel: t('auth.optional'),
      content: (
        <ProfilePictureStep
          disabled={form.isSubmitting}
          image={form.profileImage}
          onChange={form.setProfileImage}
        />
      ),
    },
  ];

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView behavior="padding" style={styles.screen}>
        <KeyboardAwareScrollView
          bottomOffset={8}
          contentContainerStyle={[styles.body, { direction }]}
          extraKeyboardSpace={8}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}>
          <AppCard padding="md" style={styles.card} variant="elevated">
            <View style={[styles.heading, { direction }]}>
              <View
                style={[
                  styles.headingIcon,
                  { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full },
                ]}>
                <AppIcon color={theme.colors.onPrimary} name="person-add-outline" size={21} />
              </View>
              <View style={styles.headingCopy}>
                <AppText numberOfLines={1} variant="titleSmall">
                  {t('auth.createAccount')}
                </AppText>
                <AppText color="muted" numberOfLines={1} variant="caption">
                  {t('auth.registerSubtitle')}
                </AppText>
              </View>
              <AppIconButton
                color={theme.colors.primary}
                disabled={form.isSubmitting}
                icon="log-in-outline"
                label={t('auth.backToSignIn')}
                onPress={() => router.replace(asHref(ROUTES.login))}
                size={22}
              />
            </View>

            <AppForm
              autoFocusFirstInput={false}
              errors={form.formErrors}
              onClearFieldError={form.clearError}
              style={styles.form}>
              <AppFormStepper
                activeStep={form.activeStep}
                compact
                keepMounted={false}
                label={t('auth.registrationSteps')}
                onStepChange={form.goToCompletedStep}
                steps={steps}
              />
            </AppForm>
          </AppCard>
        </KeyboardAwareScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
              shadowColor: theme.colors.text,
            },
          ]}>
          <View style={styles.footerContent}>
            <AppFormStepActions
              activeStep={form.activeStep}
              backDisabled={form.isSubmitting}
              onBack={form.goBack}
              onNext={form.goNext}
              onSubmit={form.submit}
              stepCount={steps.length}
              submitLabel={t('auth.completeRegistration')}
              submitting={form.isSubmitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 12,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  form: {
    gap: 10,
  },
  footer: {
    flexShrink: 0,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  footerContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
});
