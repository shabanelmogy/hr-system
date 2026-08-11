import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppDivider, AppIcon, type AppIconName, AppText } from '@/src/shared/components';

interface ModuleDrawerContentProps extends DrawerContentComponentProps {
  title: string;
  description?: string;
  icon: AppIconName;
}

export function ModuleDrawerContent({
  title,
  description,
  icon,
  ...drawerProps
}: ModuleDrawerContentProps) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <DrawerContentScrollView
      {...drawerProps}
      contentContainerStyle={[styles.content, { direction }]}>
      <View style={[styles.moduleHeader, { direction }]}>
        <View
          style={[
            styles.moduleIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
          ]}>
          <AppIcon color={theme.colors.primary} name={icon} size={24} />
        </View>
        <View style={styles.moduleText}>
          <AppText variant="label">{title}</AppText>
          {description ? (
            <AppText color="muted" numberOfLines={2} variant="caption">
              {description}
            </AppText>
          ) : null}
        </View>
      </View>
      <DrawerItem
        icon={({ color, size }) => (
          <AppIcon
            color={color}
            name={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={size}
          />
        )}
        label={t('navigation.dashboard')}
        onPress={() => router.replace(asHref(ROUTES.home))}
      />
      <AppDivider style={styles.divider} />
      <DrawerItemList {...drawerProps} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 10,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  moduleIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
