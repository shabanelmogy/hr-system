import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppText } from '@/src/shared/components';
import {
  getPermissionBusinessModuleLabel,
  type PermissionBusinessModuleSummary,
} from '../permission-groups';

interface PermissionBusinessModuleRailProps {
  horizontal: boolean;
  modules: readonly PermissionBusinessModuleSummary[];
  onSelect: (moduleCode: string) => void;
  selectedModule: string;
}

export function PermissionBusinessModuleRail({
  horizontal,
  modules,
  onSelect,
  selectedModule,
}: PermissionBusinessModuleRailProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  const content = modules.map((module) => {
    const selected = module.code.toLocaleLowerCase() === selectedModule.toLocaleLowerCase();
    const label = getPermissionBusinessModuleLabel(module.code, t);

    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityHint={t('roleManagement.moduleSelectionHint')}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        key={module.code}
        onPress={() => onSelect(module.code)}
        style={({ pressed }) => [
          styles.item,
          horizontal ? styles.horizontalItem : null,
          {
            backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.md,
            direction,
            opacity: pressed ? 0.72 : 1,
          },
        ]}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
              borderRadius: theme.radius.sm,
            },
          ]}>
          <AppIcon
            color={selected ? theme.colors.onPrimary : theme.colors.primary}
            name="apps-outline"
            size={19}
          />
        </View>
        <View style={styles.text}>
          <AppText numberOfLines={1} variant="label" weight="800">
            {label}
          </AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            {t('roleManagement.moduleScreensCount', { count: module.screenCount })}
          </AppText>
        </View>
        <AppText color={module.selectedCount ? 'primary' : 'muted'} variant="caption" weight="800">
          {t('roleManagement.selectedOfTotal', {
            selected: module.selectedCount,
            total: module.permissionCount,
          })}
        </AppText>
      </Pressable>
    );
  });

  if (horizontal) {
    return (
      <ScrollView
        accessibilityLabel={t('roleManagement.businessModuleNavigation')}
        contentContainerStyle={[styles.list, styles.horizontalList, { direction }]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return (
    <View
      accessibilityLabel={t('roleManagement.businessModuleNavigation')}
      accessibilityRole="list"
      style={styles.list}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  horizontalList: { paddingBottom: 4 },
  item: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  horizontalItem: { width: 220 },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 1 },
});
