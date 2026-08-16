import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { canAccessRoute, useAuth } from '@/src/features/auth';
import {
  PLATFORM_TOOL_MODULES,
  type PlatformToolModuleId,
} from '@/src/features/platform-tools/constants/platform-tool-definitions';
import { AppCard, AppIcon, AppScreen, AppText } from '@/src/shared/components';

export function PlatformToolsOverviewScreen({ moduleId }: { moduleId: PlatformToolModuleId }) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const moduleDefinition = PLATFORM_TOOL_MODULES[moduleId];
  const visibleTools = moduleDefinition.tools.filter((tool) =>
    canAccessRoute(tool.route, session),
  );

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <View style={styles.heading}>
        <AppText variant="title">{t(moduleDefinition.titleKey)}</AppText>
        <AppText color="muted" variant="bodySmall">
          {t(moduleDefinition.descriptionKey)}
        </AppText>
      </View>
      <View style={styles.tools}>
        {visibleTools.map((tool) => (
          <AppCard
            accessibilityLabel={t(tool.titleKey)}
            key={tool.id}
            onPress={() => router.push(asHref(tool.route))}
            style={styles.toolCard}>
            <View style={[styles.toolRow, { direction }]}>
              <View
                style={[
                  styles.toolIcon,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppIcon color={theme.colors.primary} name={tool.icon} size={25} />
              </View>
              <View style={styles.toolText}>
                <AppText variant="label">{t(tool.titleKey)}</AppText>
                <AppText color="muted" variant="bodySmall">
                  {t(tool.descriptionKey)}
                </AppText>
              </View>
              <AppIcon
                color={theme.colors.textMuted}
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={20}
              />
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 4, marginBottom: 24 },
  tools: { gap: 12 },
  toolCard: { minHeight: 96, justifyContent: 'center' },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toolIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  toolText: { flex: 1, gap: 3 },
});
