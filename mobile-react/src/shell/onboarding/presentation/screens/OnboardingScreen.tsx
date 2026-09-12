import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useOnboarding } from '@/src/core/onboarding';
import { type ThemeMode, useAppTheme } from '@/src/core/theme';
import {
  AppButton,
  AppCarousel,
  AppIcon,
  type AppIconName,
  AppSegmentedControl,
  type SegmentedOption,
  AppText,
  AppThemePalettePicker,
  showErrorDialog,
} from '@/src/shared/components';
import { LanguageSelector } from '../components/LanguageSelector';
import { OnboardingVisual } from '../components/OnboardingVisual';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: AppIconName;
  accentIcon: AppIconName;
  caption: string;
  metrics: readonly { icon: AppIconName; label: string }[];
  content?: ReactNode;
  compact?: boolean;
  hideVisual?: boolean;
}

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { mode, palette, setMode, setPalette, theme } = useAppTheme();
  const { complete } = useOnboarding();
  const { height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const compact = height < 740;
  const slideHeight = compact ? 470 : 540;
  const themeModeOptions = useMemo<readonly SegmentedOption<ThemeMode>[]>(() => [
    { label: t('settings.system'), value: 'system', icon: 'phone-portrait-outline' },
    { label: t('settings.light'), value: 'light', icon: 'sunny-outline' },
    { label: t('settings.dark'), value: 'dark', icon: 'moon-outline' },
  ], [t]);

  const slides = useMemo<OnboardingSlide[]>(() => [
    {
      id: 'language',
      title: t('onboarding.languageTitle'),
      description: t('onboarding.languageDescription'),
      icon: 'language-outline',
      accentIcon: 'globe-outline',
      caption: t('onboarding.languageCaption'),
      metrics: [
        { icon: 'text-outline', label: 'English' },
        { icon: 'swap-horizontal-outline', label: 'LTR / RTL' },
        { icon: 'language-outline', label: 'العربية' },
      ],
      compact: true,
      hideVisual: true,
      content: (
        <View style={styles.personalization}>
          <LanguageSelector compact />
          <AppSegmentedControl<ThemeMode>
            label={t('settings.appearance')}
            onChange={setMode}
            options={themeModeOptions}
            showLabel
            value={mode}
          />
          <AppThemePalettePicker compact onChange={setPalette} value={palette} />
        </View>
      ),
    },
    {
      id: 'workforce',
      title: t('onboarding.workforceTitle'),
      description: t('onboarding.workforceDescription'),
      icon: 'people-outline',
      accentIcon: 'briefcase-outline',
      caption: t('onboarding.workforceCaption'),
      metrics: [
        { icon: 'person-add-outline', label: t('onboarding.recruitment') },
        { icon: 'calendar-outline', label: t('onboarding.attendance') },
        { icon: 'wallet-outline', label: t('onboarding.payroll') },
      ],
    },
    {
      id: 'control',
      title: t('onboarding.controlTitle'),
      description: t('onboarding.controlDescription'),
      icon: 'business-outline',
      accentIcon: 'shield-checkmark-outline',
      caption: t('onboarding.controlCaption'),
      metrics: [
        { icon: 'git-branch-outline', label: t('onboarding.companies') },
        { icon: 'key-outline', label: t('onboarding.permissions') },
        { icon: 'lock-closed-outline', label: t('onboarding.tenantIsolation') },
      ],
    },
    {
      id: 'realtime',
      title: t('onboarding.realtimeTitle'),
      description: t('onboarding.realtimeDescription'),
      icon: 'sync-outline',
      accentIcon: 'phone-portrait-outline',
      caption: t('onboarding.realtimeCaption'),
      metrics: [
        { icon: 'desktop-outline', label: t('onboarding.web') },
        { icon: 'notifications-outline', label: t('onboarding.notifications') },
        { icon: 'phone-portrait-outline', label: t('onboarding.mobile') },
      ],
    },
  ], [mode, palette, setMode, setPalette, t, themeModeOptions]);

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      await complete();
    } catch (error) {
      setFinishing(false);
      showErrorDialog(error, t('onboarding.finishFailed'));
    }
  };

  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { direction }]}>
        <View style={[styles.brand, { direction }]}>
          <View
            style={[
              styles.brandIcon,
              { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.onPrimary} name="people" size={24} />
          </View>
          <AppText variant="label" weight="800">{t('common.appName')}</AppText>
        </View>
        {!isLast ? (
          <AppButton
            disabled={finishing}
            icon={isRTL ? 'play-skip-back-outline' : 'play-skip-forward-outline'}
            onPress={() => void finish()}
            variant="ghost">
            {t('onboarding.skip')}
          </AppButton>
        ) : null}
      </View>

      <View style={styles.carousel}>
        <AppCarousel
          items={slides}
          keyExtractor={(slide) => slide.id}
          onIndexChange={setIndex}
          renderItem={(slide) => {
            const content = (
              <>
                {!slide.hideVisual ? (
                  <OnboardingVisual
                    accentIcon={slide.accentIcon}
                    caption={slide.caption}
                    icon={slide.icon}
                    metrics={slide.metrics}
                  />
                ) : null}
                <View style={styles.copy}>
                  <AppText align="center" variant={slide.compact ? 'titleSmall' : 'display'}>
                    {slide.title}
                  </AppText>
                  <AppText
                    align="center"
                    color="muted"
                    variant={slide.compact ? 'bodySmall' : 'body'}>
                    {slide.description}
                  </AppText>
                </View>
                {slide.content ? <View style={styles.slideContent}>{slide.content}</View> : null}
              </>
            );

            return slide.compact ? (
              <View style={[styles.slide, styles.slideCompact, { height: slideHeight }]}>
                {content}
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={[styles.slide, { minHeight: slideHeight }]}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: slideHeight }}>
                {content}
              </ScrollView>
            );
          }}
          selectedIndex={index}
        />
      </View>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
        ]}>
        <View accessibilityLabel={t('onboarding.progress')} style={[styles.dots, { direction }]}>
          {slides.map((slide, dotIndex) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  backgroundColor: dotIndex === index
                    ? theme.colors.primary
                    : theme.colors.border,
                  width: dotIndex === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={[styles.actions, { direction }]}>
          <AppButton
            disabled={index === 0 || finishing}
            icon={isRTL ? 'chevron-forward-outline' : 'chevron-back-outline'}
            onPress={() => setIndex((current) => Math.max(0, current - 1))}
            style={styles.action}
            variant="outline">
            {t('common.previous')}
          </AppButton>
          <AppButton
            icon={isLast ? 'checkmark-outline' : isRTL ? 'chevron-back-outline' : 'chevron-forward-outline'}
            loading={finishing}
            onPress={() => void (isLast
              ? finish()
              : setIndex((current) => Math.min(slides.length - 1, current + 1)))}
            style={styles.action}>
            {isLast ? t('onboarding.getStarted') : t('common.next')}
          </AppButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  carousel: { flex: 1, justifyContent: 'center' },
  slide: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  slideCompact: { gap: 10, paddingVertical: 6 },
  copy: { alignItems: 'center', gap: 8 },
  slideContent: { width: '100%' },
  personalization: { width: '100%', gap: 8 },
  footer: { gap: 12, borderTopWidth: StyleSheet.hairlineWidth, padding: 16 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  action: { flex: 1, maxWidth: 260 },
});
