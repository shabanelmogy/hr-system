import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth, type SessionResponse } from '@/src/features/auth';
import { useProfilePhoto, type UserProfilePhoto } from '@/src/features/auth/profile';
import {
  TenantNameBadge,
  TenantPlanBadge,
  TenantReadOnlyBadge,
  TenantSubscriptionStatusBadge,
} from '@/src/features/tenant-access';
import { AppText } from '@/src/shared/components';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const { data: userPhoto } = useProfilePhoto();
  const photoUri = getPhotoUri(userPhoto);
  const displayName = getDisplayName(session);
  const initials = getInitials(session);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.content,
        { direction, backgroundColor: theme.colors.surface },
      ]}>
      <Pressable
        accessibilityLabel={`${t('navigation.profile')}: ${displayName}`}
        accessibilityRole="button"
        onPress={() => {
          props.navigation.closeDrawer();
          router.navigate(asHref(ROUTES.profile));
        }}
        style={({ pressed }) => [
          styles.profile,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.72 : 1,
          },
        ]}>
        <UserAvatar initials={initials} photoUri={photoUri} />
        <View style={styles.identity}>
          <AppText align="center" numberOfLines={1} variant="titleSmall" weight="800">
            {displayName}
          </AppText>
          {session?.email?.trim() ? (
            <AppText align="center" color="muted" numberOfLines={1} variant="caption">
              {session.email.trim()}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.badges, { direction }]}>
          <TenantNameBadge />
          <TenantPlanBadge />
          <TenantSubscriptionStatusBadge />
          <TenantReadOnlyBadge />
        </View>
      </Pressable>

      <View style={styles.navigationItems}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

function UserAvatar({ initials, photoUri }: { initials: string; photoUri: string | null }) {
  const { theme } = useAppTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const canShowPhoto = Boolean(photoUri && photoUri !== failedUri);

  if (photoUri && canShowPhoto) {
    return (
      <Image
        accessibilityLabel={initials}
        onError={() => setFailedUri(photoUri)}
        source={{ uri: photoUri }}
        style={[styles.avatar, { borderColor: theme.colors.primary }]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={initials}
      style={[
        styles.avatar,
        styles.avatarFallback,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.primary,
        },
      ]}>
      <AppText align="center" color="primary" variant="title" weight="800">
        {initials}
      </AppText>
    </View>
  );
}

function getPhotoUri(photo: UserProfilePhoto | undefined): string | null {
  const value = photo?.profilePicture?.trim();
  if (!value) return null;
  if (value.startsWith('data:')) return value;

  return `data:${photo?.contentType?.trim() || 'image/jpeg'};base64,${value}`;
}

function getDisplayName(session: SessionResponse | null): string {
  const fullName = [session?.firstName, session?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return fullName || session?.userName?.trim() || session?.email?.trim() || 'User';
}

function getInitials(session: SessionResponse | null): string {
  const nameParts = [session?.firstName, session?.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (nameParts.length > 0) {
    return nameParts.map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  return session?.userName?.trim().slice(0, 2).toUpperCase() || 'U';
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 0,
  },
  profile: {
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },
  avatar: {
    width: 82,
    height: 82,
    borderWidth: 2,
    borderRadius: 41,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  badges: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  navigationItems: {
    flex: 1,
    paddingTop: 8,
  },
});
