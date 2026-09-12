import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES, type AppRoute } from '@/src/core/constants/routes';
import { useAppTheme, type AppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppIcon,
  type AppIconName,
  AppScreen,
  AppStateView,
  AppText,
} from '@/src/shared/components';
import { useAccessibleModules } from '../queries/use-modules';
import type { ErpModule } from '../../domain/models/module';

export function ModuleLauncherScreen({ moduleCode }: { moduleCode?: string }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const modulesQuery = useAccessibleModules();
  if (modulesQuery.isLoading) {
    return <AppScreen><AppStateView state="loading" /></AppScreen>;
  }
  if (modulesQuery.isError) {
    return (
      <AppScreen>
        <AppStateView
          state="error"
          title={t('modules.error')}
          onRetry={() => void modulesQuery.refetch()}
        />
      </AppScreen>
    );
  }

  const selected = moduleCode
    ? modulesQuery.data?.find(item => item.code.toLowerCase() === moduleCode.toLowerCase())
    : undefined;
  if (moduleCode && !selected) {
    return <AppScreen><AppStateView state="empty" title={t('modules.genericEmpty')} /></AppScreen>;
  }

  const title = selected ? titleFor(selected, t) : t('modules.title');
  const items = selected
    ? selected.submodules.map((item) => ({
        code: item.code,
        title: titleForSubmodule(selected.code, item, t),
        path: (item.entryPath ?? ROUTES.submodule(selected.code, item.code)) as AppRoute,
        isPrimary: false,
        ...getSubmodulePresentation(item.code, theme),
      }))
    : (modulesQuery.data ?? []).map((item) => ({
        code: item.code,
        title: titleFor(item, t),
        path: ROUTES.module(item.code) as AppRoute,
        isPrimary: true,
        ...getModulePresentation(item.code, theme),
      }));

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={[styles.header, { gap: theme.spacing.sm }]}>
        <AppText style={styles.centerText} variant="title">{title}</AppText>
        <AppText color="muted" style={styles.centerText}>
          {selected ? t('modules.submoduleDescription') : t('modules.description')}
        </AppText>
      </View>

      {items.length > 0 ? (
        <View style={[styles.grid, { gap: theme.spacing.lg, marginTop: theme.spacing.xxl }]}>
          {items.map((item) => (
            <AppCard
              key={item.code}
              accessibilityLabel={item.title}
              onPress={() => router.push(asHref(item.path))}
              padding={item.isPrimary ? 'md' : 'sm'}
              pressedStyle={styles.tilePressed}
              style={[styles.tile, item.isPrimary ? styles.moduleTile : styles.submoduleTile]}
              variant={item.isPrimary ? 'elevated' : 'filled'}
            >
              <View
                style={[
                  styles.iconBox,
                  item.isPrimary ? styles.moduleIconBox : styles.submoduleIconBox,
                  {
                    backgroundColor: item.color,
                    borderRadius: theme.radius.md,
                    shadowColor: item.color,
                  },
                ]}
              >
                <AppIcon color={theme.colors.onSolid} name={item.icon} size={item.iconSize} />
              </View>
              <AppText
                style={[styles.tileLabel, item.isPrimary ? styles.moduleTileLabel : null]}
                variant={item.isPrimary ? 'body' : 'bodySmall'}
                weight="700"
              >
                {item.title}
              </AppText>
            </AppCard>
          ))}
        </View>
      ) : (
        <View style={{ marginTop: theme.spacing.xxxl }}>
          <AppStateView
            state="empty"
            title={selected?.code === 'acc'
              ? t('modules.accountingEmpty')
              : t('modules.genericEmpty')}
          />
        </View>
      )}
    </AppScreen>
  );
}

function getModulePresentation(code: string, theme: AppTheme) {
  if (code.toLowerCase() === 'hr') {
    return { icon: 'people-outline' as AppIconName, color: theme.colors.primary, iconSize: 52 };
  }
  if (code.toLowerCase() === 'acc') {
    return { icon: 'calculator-outline' as AppIconName, color: theme.colors.success, iconSize: 52 };
  }
  return { icon: 'apps-outline' as AppIconName, color: theme.colors.secondary, iconSize: 52 };
}

function getSubmodulePresentation(code: string, theme: AppTheme) {
  const presentations: Record<string, { icon: AppIconName; color: string; iconSize: number }> = {
    'basic-data': { icon: 'server-outline', color: theme.colors.secondary, iconSize: 34 },
    recruitment: { icon: 'person-add-outline', color: theme.colors.accent, iconSize: 34 },
    workforce: { icon: 'briefcase-outline', color: theme.colors.primary, iconSize: 34 },
    attendance: { icon: 'finger-print-outline', color: theme.colors.warning, iconSize: 34 },
    analytics: { icon: 'analytics-outline', color: theme.colors.success, iconSize: 34 },
    administration: { icon: 'shield-checkmark-outline', color: theme.colors.danger, iconSize: 34 },
    collaboration: { icon: 'chatbubbles-outline', color: theme.colors.secondary, iconSize: 34 },
  };
  return presentations[code.toLowerCase()] ?? {
    icon: 'grid-outline' as AppIconName,
    color: theme.colors.primary,
    iconSize: 34,
  };
}

function titleFor(
  item: ErpModule | ErpModule['submodules'][number],
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  return t(`modules.${item.code}`, { defaultValue: item.name });
}

function titleForSubmodule(
  moduleCode: string,
  item: ErpModule['submodules'][number],
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  return t(`modules.submodules.${moduleCode}.${item.code}`, { defaultValue: item.name });
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 680,
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    maxWidth: 920,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    borderWidth: 0,
  },
  moduleTile: {
    width: 158,
    minHeight: 174,
    gap: 14,
  },
  submoduleTile: {
    width: 132,
    minHeight: 126,
  },
  tilePressed: {
    transform: [{ scale: 0.97 }],
  },
  iconBox: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  moduleIconBox: {
    width: 104,
    height: 104,
    elevation: 7,
  },
  submoduleIconBox: {
    width: 76,
    height: 76,
  },
  tileLabel: {
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  moduleTileLabel: {
    lineHeight: 22,
  },
});
