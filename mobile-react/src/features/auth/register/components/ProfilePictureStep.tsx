import * as ImagePicker from 'expo-image-picker';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import type { RegisterProfileImage } from '@/src/features/auth/register/hooks/useRegisterForm';
import {
  AppButton,
  AppIcon,
  AppText,
  showToast,
} from '@/src/shared/components';

const MAX_PROFILE_PICTURE_BYTES = 10 * 1024 * 1024;

interface ProfilePictureStepProps {
  disabled: boolean;
  image: RegisterProfileImage | null;
  onChange: (image: RegisterProfileImage | null) => void;
}

export function ProfilePictureStep({ disabled, image, onChange }: ProfilePictureStepProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (asset.fileSize != null && asset.fileSize > MAX_PROFILE_PICTURE_BYTES) {
        showToast.warning(t('auth.profilePictureTooLarge'));
        return;
      }
      if (!asset.base64) {
        showToast.warning(t('auth.profilePictureReadFailed'));
        return;
      }

      onChange({ base64: asset.base64, uri: asset.uri });
    } catch (error) {
      showToast.error(error, t('auth.profilePictureReadFailed'));
    }
  };

  return (
    <View style={styles.content}>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.full,
            },
          ]}>
          {image ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={t('auth.profilePicturePreview')}
              source={{ uri: image.uri }}
              style={[styles.image, { borderRadius: theme.radius.full }]}
            />
          ) : (
            <AppIcon color={theme.colors.textMuted} name="person-outline" size={54} />
          )}
          <View
            style={[
              styles.cameraBadge,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.surface,
                borderRadius: theme.radius.full,
              },
            ]}>
            <AppIcon color={theme.colors.onPrimary} name="camera" size={18} />
          </View>
        </View>

        <View style={styles.copy}>
          <AppText align="center" variant="label">
            {image ? t('auth.profilePictureReady') : t('auth.profilePictureOptional')}
          </AppText>
          <AppText align="center" color="muted" variant="caption">
            {t('auth.profilePictureHint')}
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton
            disabled={disabled}
            icon={image ? 'image-outline' : 'cloud-upload-outline'}
            onPress={() => void pickImage()}
            style={styles.action}
            variant="outline">
            {image ? t('auth.changePhoto') : t('auth.choosePhoto')}
          </AppButton>
          {image ? (
            <AppButton
              disabled={disabled}
              icon="trash-outline"
              onPress={() => onChange(null)}
              style={styles.action}
              variant="ghost">
              {t('auth.removePhoto')}
            </AppButton>
          ) : null}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  preview: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 7,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  copy: {
    alignItems: 'center',
    gap: 4,
    maxWidth: 380,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    flexGrow: 1,
    maxWidth: 210,
  },
});
