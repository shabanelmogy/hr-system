import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Image, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import {
  ProfilePhotoCropModal,
  type ProfilePhotoCropSource,
} from '@/src/features/auth/profile/components/ProfilePhotoCropModal';
import {
  useProfileInfo,
  useProfilePhoto,
  useChangeProfilePassword,
  useUpdateProfileInfo,
  useUpdateProfilePhoto,
} from '@/src/features/auth/profile/hooks/useProfile';
import type {
  ChangeProfilePasswordFormValues,
  ProfilePhotoUpload,
  UpdateProfileRequest,
} from '@/src/features/auth/profile/types';
import {
  createChangePasswordSchema,
  createProfileSchema,
} from '@/src/features/auth/profile/validation/profile-validation';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppFormTabs,
  AppIconButton,
  AppModal,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';

const MAX_PROFILE_PICTURE_BYTES = 10 * 1024 * 1024;
type ProfileTab = 'personal' | 'security';
type ProfilePhotoSource = 'camera' | 'gallery';

export function ProfileScreen() {
  const { direction } = useLocalization();
  const { session } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const infoQuery = useProfileInfo();
  const photoQuery = useProfilePhoto();
  const updateInfo = useUpdateProfileInfo();
  const updatePhoto = useUpdateProfilePhoto();
  const changePassword = useChangeProfilePassword();
  const { refetch: refetchInfo } = infoQuery;
  const { refetch: refetchPhoto } = photoQuery;
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [photoSourceOpen, setPhotoSourceOpen] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<ProfilePhotoCropSource | null>(null);

  const schema = useMemo(() => createProfileSchema(t), [t]);
  const defaults = useMemo<UpdateProfileRequest>(() => ({
    id: infoQuery.data?.id ?? session?.userId ?? '',
    firstName: infoQuery.data?.firstName ?? session?.firstName ?? '',
    lastName: infoQuery.data?.lastName ?? session?.lastName ?? '',
    userName: infoQuery.data?.userName ?? session?.userName ?? '',
  }), [infoQuery.data, session]);
  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useZodForm<UpdateProfileRequest>(schema, { defaultValues: defaults });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  useFocusEffect(
    useCallback(() => {
      void refetchInfo();
      void refetchPhoto();
    }, [refetchInfo, refetchPhoto]),
  );

  const isReadOnly = session?.tenantReadOnly ?? false;
  const passwordSchema = useMemo(() => createChangePasswordSchema(t), [t]);
  const passwordForm = useZodForm<ChangeProfilePasswordFormValues>(passwordSchema, {
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const isSaving = updateInfo.isPending || updatePhoto.isPending || changePassword.isPending;
  const photoUri = toPhotoUri(photoQuery.data?.profilePicture, photoQuery.data?.contentType);
  const displayName = getDisplayName(
    infoQuery.data?.firstName ?? session?.firstName,
    infoQuery.data?.lastName ?? session?.lastName,
    infoQuery.data?.userName ?? session?.userName,
    t('profile.defaultUser'),
  );

  const saveInfo = handleSubmit(async (values) => {
    try {
      await updateInfo.mutateAsync(values);
      reset(values);
      setEditing(false);
      showToast.success(t('profile.updated'));
    } catch (error) {
      showToast.error(error, t('profile.updateFailed'));
    }
  });

  const cancelEdit = () => {
    reset(defaults);
    setEditing(false);
  };

  const savePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      showToast.success(t('profile.passwordUpdated'));
    } catch (error) {
      showToast.error(error, t('profile.passwordUpdateFailed'));
    }
  });

  const choosePhoto = async (source: ProfilePhotoSource) => {
    setPhotoSourceOpen(false);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showToast.warning(t('profile.cameraPermissionRequired'));
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 0.85,
      };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      const image = toCropSource(result.assets[0]);
      if (!image) {
        showToast.warning(t('profile.invalidImage'));
        return;
      }
      if (image.fileSize != null && image.fileSize > MAX_PROFILE_PICTURE_BYTES) {
        showToast.warning(t('profile.imageTooLarge'));
        return;
      }

      setPendingPhoto(image);
    } catch (error) {
      showToast.error(error, t('profile.updateFailed'));
    }
  };

  const confirmPhoto = async (photo: ProfilePhotoUpload) => {
    try {
      await updatePhoto.mutateAsync(photo);
      setPendingPhoto(null);
      showToast.success(t('profile.photoUpdated'));
    } catch (error) {
      showToast.error(error, t('profile.updateFailed'));
    }
  };

  const removePhoto = async () => {
    try {
      await updatePhoto.mutateAsync(null);
      showToast.success(t('profile.photoUpdated'));
    } catch (error) {
      showToast.error(error, t('profile.updateFailed'));
    }
  };

  if (infoQuery.isLoading && !infoQuery.data) {
    return <AppScreen><AppStateView state="loading" /></AppScreen>;
  }

  if (infoQuery.isError && !infoQuery.data) {
    return (
      <AppScreen>
        <AppStateView
          message={getErrorMessage(infoQuery.error, t('profile.loadFailed'))}
          onRetry={() => void infoQuery.refetch()}
          state="error"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => {
            void infoQuery.refetch();
            void photoQuery.refetch();
          }}
          refreshing={infoQuery.isRefetching || photoQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        subtitle={infoQuery.data?.email ?? session?.email ?? ''}
        title={t('profile.title')}
      />

      {isReadOnly ? (
        <AppAlert severity="warning">{t('profile.readOnly')}</AppAlert>
      ) : null}

      <AppCard padding="md" style={styles.identityCard}>
        <View style={[styles.identityHeader, { direction }]}>
          <View
            accessibilityLabel={displayName}
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
            ]}>
            {photoUri ? (
              <Image
                accessibilityLabel={displayName}
                source={{ uri: photoUri }}
                style={styles.image}
              />
            ) : (
              <AppText color="primary" variant="title" weight="800">
                {getInitials(displayName)}
              </AppText>
            )}
          </View>
          <View style={styles.identityText}>
            <AppText numberOfLines={1} variant="titleSmall">{displayName}</AppText>
            <AppText color="muted" numberOfLines={1} variant="caption">
              @{defaults.userName}
            </AppText>
          </View>
          <View style={[styles.compactPhotoActions, { direction }]}>
            <AppIconButton
              color={theme.colors.primary}
              disabled={isReadOnly || isSaving}
              icon={updatePhoto.isPending ? 'hourglass-outline' : 'camera-outline'}
              label={t('profile.changePhoto')}
              onPress={() => setPhotoSourceOpen(true)}
              size={32}
              style={styles.photoPickerButton}
            />
            {photoUri ? (
              <AppIconButton
                color={theme.colors.danger}
                disabled={isReadOnly || isSaving}
                icon="trash-outline"
                label={t('profile.removePhoto')}
                onPress={() => void removePhoto()}
              />
            ) : null}
          </View>
        </View>
      </AppCard>

      <AppFormTabs<ProfileTab>
        keepMounted
        label={t('profile.tabsLabel')}
        onChange={setActiveTab}
        tabs={[
          {
            value: 'personal',
            label: t('profile.personalInformation'),
            icon: 'person-outline',
            hasError: Object.keys(errors).length > 0,
            errorLabel: t('profile.tabHasErrors'),
            content: (
              <AppCard style={styles.detailsCard}>
                <View style={styles.fields}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field }) => (
                      <AppTextField
                        editable={editing && !isSaving && !isReadOnly}
                        label={t('profile.firstName')}
                        leadingIcon="person-outline"
                        maxLength={50}
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field }) => (
                      <AppTextField
                        editable={editing && !isSaving && !isReadOnly}
                        label={t('profile.lastName')}
                        leadingIcon="person-outline"
                        maxLength={50}
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="userName"
                    render={({ field }) => (
                      <AppTextField
                        autoCapitalize="none"
                        editable={editing && !isSaving && !isReadOnly}
                        label={t('profile.userName')}
                        leadingIcon="at-outline"
                        maxLength={50}
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        value={field.value}
                      />
                    )}
                  />
                  <AppTextField
                    editable={false}
                    label={t('profile.email')}
                    leadingIcon="mail-outline"
                    value={infoQuery.data?.email ?? session?.email ?? ''}
                  />
                </View>

                {Object.keys(errors).length > 0 ? (
                  <AppAlert severity="error">
                    {Object.values(toFormErrorMap(errors)).join('\n')}
                  </AppAlert>
                ) : null}

                <View style={[styles.formActions, { direction }]}>
                  {editing ? (
                    <>
                      <AppButton
                        disabled={isSaving}
                        icon="close-outline"
                        onPress={cancelEdit}
                        style={styles.actionButton}
                        variant="ghost">
                        {t('profile.cancel')}
                      </AppButton>
                      <AppButton
                        disabled={!isDirty || isReadOnly}
                        icon="checkmark-outline"
                        loading={updateInfo.isPending}
                        onPress={() => void saveInfo()}
                        style={styles.actionButton}>
                        {t('profile.save')}
                      </AppButton>
                    </>
                  ) : (
                    <AppButton
                      disabled={isReadOnly}
                      icon="create-outline"
                      onPress={() => {
                        clearErrors();
                        setEditing(true);
                      }}
                      style={styles.actionButton}>
                      {t('profile.edit')}
                    </AppButton>
                  )}
                </View>
              </AppCard>
            ),
          },
          {
            value: 'security',
            label: t('profile.security'),
            icon: 'shield-checkmark-outline',
            hasError: Object.keys(passwordForm.formState.errors).length > 0,
            errorLabel: t('profile.tabHasErrors'),
            content: (
              <AppCard style={styles.passwordCard}>
                <View style={styles.fields}>
                  <Controller
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <AppTextField
                        editable={!changePassword.isPending}
                        label={t('profile.currentPassword')}
                        leadingIcon="lock-closed-outline"
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        secureTextEntry
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <AppTextField
                        editable={!changePassword.isPending}
                        label={t('profile.newPassword')}
                        leadingIcon="key-outline"
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        secureTextEntry
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <AppTextField
                        editable={!changePassword.isPending}
                        label={t('profile.confirmPassword')}
                        leadingIcon="shield-checkmark-outline"
                        name={field.name}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        ref={field.ref}
                        required
                        secureTextEntry
                        value={field.value}
                      />
                    )}
                  />
                </View>
                {Object.keys(passwordForm.formState.errors).length > 0 ? (
                  <AppAlert severity="error">
                    {Object.values(toFormErrorMap(passwordForm.formState.errors)).join('\n')}
                  </AppAlert>
                ) : null}
                <View style={[styles.formActions, { direction }]}>
                  <AppButton
                    disabled={!passwordForm.formState.isDirty}
                    icon="key-outline"
                    loading={changePassword.isPending}
                    onPress={() => void savePassword()}
                    style={styles.actionButton}>
                    {t('profile.changePassword')}
                  </AppButton>
                </View>
              </AppCard>
            ),
          },
        ]}
        value={activeTab}
      />

      <AppModal
        closeLabel={t('common.close')}
        icon="camera-outline"
        onClose={() => setPhotoSourceOpen(false)}
        scrollable={false}
        subtitle={t('profile.photoSourceDescription')}
        title={t('profile.photoSourceTitle')}
        visible={photoSourceOpen}>
        <View style={styles.photoSourceActions}>
          <AppButton
            icon="camera-outline"
            onPress={() => void choosePhoto('camera')}
            variant="outline">
            {t('profile.takePhoto')}
          </AppButton>
          <AppButton
            icon="images-outline"
            onPress={() => void choosePhoto('gallery')}
            variant="outline">
            {t('profile.chooseFromGallery')}
          </AppButton>
        </View>
      </AppModal>

      <ProfilePhotoCropModal
        loading={updatePhoto.isPending}
        onClose={() => setPendingPhoto(null)}
        onConfirm={confirmPhoto}
        onError={(error) => showToast.error(error, t('profile.updateFailed'))}
        source={pendingPhoto}
      />
    </AppScreen>
  );
}

function toPhotoUri(value: string | null | undefined, contentType: string | null | undefined) {
  if (!value) return null;
  if (/^(data:|https?:|file:|content:)/i.test(value)) return value;
  return `data:${contentType || 'image/jpeg'};base64,${value}`;
}

function toCropSource(asset: ImagePicker.ImagePickerAsset): ProfilePhotoCropSource | null {
  const extension = asset.fileName?.split('.').pop()?.toLowerCase();
  const mimeType = asset.mimeType === 'image/png' || extension === 'png'
    ? 'image/png'
    : asset.mimeType === 'image/jpeg' || extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : null;
  if (!mimeType) return null;

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `profile.${mimeType === 'image/png' ? 'png' : 'jpg'}`,
    mimeType,
    fileSize: asset.fileSize ?? null,
    width: asset.width,
    height: asset.height,
  };
}

function getDisplayName(firstName: string | undefined, lastName: string | undefined, userName: string | undefined, fallback: string) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || userName || fallback;
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

const styles = StyleSheet.create({
  identityCard: { gap: 0 },
  identityHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  identityText: { flex: 1, minWidth: 0, gap: 2 },
  compactPhotoActions: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  photoPickerButton: { width: 56, height: 56 },
  photoSourceActions: { gap: 10 },
  detailsCard: { gap: 18 },
  passwordCard: { gap: 18 },
  fields: { gap: 12 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10 },
  actionButton: { flexGrow: 1, maxWidth: 190 },
});
