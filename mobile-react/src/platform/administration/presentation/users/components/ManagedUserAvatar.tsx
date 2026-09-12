import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components';

interface ManagedUserAvatarProps {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  size?: number;
}

export function ManagedUserAvatar({
  firstName,
  lastName,
  profilePicture,
  size = 34,
}: ManagedUserAvatarProps) {
  const { theme } = useAppTheme();
  const imageUri = getImageUri(profilePicture);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const label = `${firstName} ${lastName}`.trim();

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.full,
        },
      ]}>
      {imageUri ? (
        <Image accessibilityLabel={label} source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <AppText color="primary" variant="caption" weight="800">
          {initials}
        </AppText>
      )}
    </View>
  );
}

function getImageUri(value: string | null): string | null {
  if (!value) return null;
  return /^(https?:|data:image\/|file:|content:)/i.test(value) ? value : null;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
