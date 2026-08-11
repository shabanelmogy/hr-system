import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import { useLogout } from '@/src/features/auth/hooks/useLogout';
import { AppIcon, AppIconButton, AppText } from '@/src/shared/components';

interface AppAppBarProps {
  showDrawer?: boolean;
  showLogout?: boolean;
  onDrawerPress?: () => void;
}

export function AppAppBar({
  showDrawer = false,
  showLogout = false,
  onDrawerPress,
}: AppAppBarProps) {
  const { t } = useTranslation();
  const { direction, language, setLanguage } = useLocalization();
  const { theme, resolvedMode, setMode } = useAppTheme();
  const { session } = useAuth();
  const { isLoggingOut, logout } = useLogout();
  const { width } = useWindowDimensions();
  const compactAuthenticatedBar = width < 520 && (showDrawer || showLogout);
  const developmentRoleLabel =
    __DEV__ && session?.roles.length ? session.roles.join(', ') : null;

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
      <View
        accessibilityRole="header"
        style={[
          styles.appBar,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.text,
          },
        ]}>
        <View style={[styles.toolbar, { direction }]}>
          <View style={[styles.brand, { direction }]}>
            {showDrawer ? (
              <AppIconButton
                color={theme.colors.onPrimary}
                icon="menu-outline"
                label={t('navigation.openMenu')}
                onPress={onDrawerPress}
                pressedBackgroundColor="transparent"
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              />
            ) : null}
            <AppIcon color={theme.colors.onPrimary} name="people-outline" size={26} />
            {!compactAuthenticatedBar ? (
              <AppText style={{ color: theme.colors.onPrimary }} variant="label" weight="800">
                {t('common.appName')}
              </AppText>
            ) : null}
            {developmentRoleLabel ? (
              <View
                accessibilityLabel={`Development role: ${developmentRoleLabel}`}
                style={[
                  styles.roleBadge,
                  { borderColor: theme.colors.onPrimary },
                ]}>
                <AppText
                  numberOfLines={1}
                  style={{ color: theme.colors.onPrimary }}
                  variant="caption"
                  weight="800">
                  DEV · {developmentRoleLabel}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={[styles.actions, { direction }]}>
            <View style={[styles.languageAction, { direction }]}>
              {!compactAuthenticatedBar ? (
                <AppText
                  style={{ color: theme.colors.onPrimary }}
                  variant="caption"
                  weight="700">
                  {language === 'ar' ? 'AR' : 'EN'}
                </AppText>
              ) : null}
              <AppIconButton
                color={theme.colors.onPrimary}
                icon="language-outline"
                label={t('auth.changeLanguage')}
                onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                pressedBackgroundColor="transparent"
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              />
            </View>
            <AppIconButton
              color={theme.colors.onPrimary}
              icon={resolvedMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              label={t('auth.changeTheme')}
              onPress={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
              pressedBackgroundColor="transparent"
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            />
            {showLogout ? (
              <AppIconButton
                color={theme.colors.onPrimary}
                disabled={isLoggingOut}
                icon={isLoggingOut ? 'hourglass-outline' : 'log-out-outline'}
                label={t('auth.logout')}
                onPress={() => void logout()}
                pressedBackgroundColor="transparent"
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              />
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    width: '100%',
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  toolbar: {
    width: '100%',
    maxWidth: 1040,
    minHeight: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  languageAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    maxWidth: 132,
    minHeight: 26,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
  },
});
