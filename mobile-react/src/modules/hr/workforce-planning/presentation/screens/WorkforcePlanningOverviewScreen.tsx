import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { canAccessRoute, useAuth } from '@/src/platform/auth';
import { AppCard, AppIcon, AppScreen, AppText } from '@/src/shared/components';

export function WorkforcePlanningOverviewScreen() {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const sections = [
    { title: t('workforcePlanning.plans'), description: t('workforcePlanning.plansDescription'), icon: 'document-text-outline' as const, route: ROUTES.workforcePlanning.plans },
    { title: t('workforcePlanning.budgets'), description: t('workforcePlanning.budgetsDescription'), icon: 'cash-outline' as const, route: ROUTES.workforcePlanning.budgets },
    { title: t('workforcePlanning.authorizedPositionCapacity'), description: t('workforcePlanning.positionEnvelopesDescription'), icon: 'cube-outline' as const, route: ROUTES.workforcePlanning.positionEnvelopes },
    { title: t('workforcePlanning.staffingRequests'), description: t('workforcePlanning.staffingRequestsDescription'), icon: 'people-outline' as const, route: ROUTES.workforcePlanning.staffingRequests },
    { title: t('workforcePlanning.capacityAmendments'), description: t('workforcePlanning.envelopeAmendmentsDescription'), icon: 'add-circle-outline' as const, route: ROUTES.workforcePlanning.envelopeAmendments },
    { title: t('workforcePlanning.planningTraceCommitments'), description: t('workforcePlanning.workforceTraceDescription'), icon: 'git-branch-outline' as const, route: ROUTES.workforcePlanning.trace },
  ].filter((section) => canAccessRoute(section.route, session));

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <View style={styles.heading}>
        <AppText variant="title">{t('workforcePlanning.title')}</AppText>
        <AppText color="muted" variant="bodySmall">{t('workforcePlanning.description')}</AppText>
      </View>
      <View style={styles.sections}>
        {sections.map((section) => (
          <AppCard accessibilityLabel={section.title} key={section.route} onPress={() => router.push(asHref(section.route))} style={styles.sectionCard}>
            <View style={[styles.sectionRow, { direction }]}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
                <AppIcon color={theme.colors.primary} name={section.icon} size={25} />
              </View>
              <View style={styles.sectionText}>
                <AppText variant="label">{section.title}</AppText>
                <AppText color="muted" variant="bodySmall">{section.description}</AppText>
              </View>
              <AppIcon color={theme.colors.textMuted} name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} />
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 4, marginBottom: 24 },
  sections: { gap: 12 },
  sectionCard: { minHeight: 96, justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  sectionText: { flex: 1, gap: 3 },
});
