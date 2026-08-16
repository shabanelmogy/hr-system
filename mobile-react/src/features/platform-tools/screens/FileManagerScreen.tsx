import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';
import {
  useDeleteFile,
  useStoredFiles,
  useUploadFiles,
} from '@/src/features/platform-tools/hooks/usePlatformTools';
import type { StoredFile, UploadFileAsset } from '@/src/features/platform-tools/types/platform-tools';
import {
  formatPlatformDate,
  getPlatformToolErrorMessage,
} from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppIconButton,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
  AppTextField,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';

export function FileManagerScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const filesQuery = useStoredFiles();
  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const files = useMemo(() => filesQuery.data ?? [], [filesQuery.data]);
  const filteredFiles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(i18n.language);
    if (!term) return files;
    return files.filter((file) => [file.fileName, file.fileExtension, file.contentType]
      .some((value) => value.toLocaleLowerCase(i18n.language).includes(term)));
  }, [files, i18n.language, search]);

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: '*/*',
      });
      if (result.canceled) return;

      const assets: UploadFileAsset[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        size: asset.size ?? null,
        webFile: asset.file,
      }));
      await uploadMutation.mutateAsync(assets);
      showToast.success(t('platformTools.files.uploaded'));
    } catch (error) {
      showToast.error(error, t('platformTools.files.uploadFailed'));
    }
  };

  const download = useCallback(async (file: StoredFile) => {
    setDownloadingId(file.id);
    try {
      await platformToolsApi.downloadFile(file);
    } catch (error) {
      showToast.error(error, t('platformTools.files.downloadFailed'));
    } finally {
      setDownloadingId(null);
    }
  }, [t]);

  const remove = async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.storedFileName);
    showToast.success(t('platformTools.files.deleted'));
    setPendingDelete(null);
  };

  const columns = useMemo<AppDataTableColumn<StoredFile>[]>(() => [
    {
      id: 'name',
      header: t('platformTools.files.name'),
      width: 230,
      render: (file) => <AppText variant="bodySmall">{file.fileName}</AppText>,
      sortValue: (file) => file.fileName,
    },
    {
      id: 'type',
      header: t('platformTools.files.type'),
      width: 150,
      render: (file) => <AppText color="muted" variant="bodySmall">{file.fileExtension || file.contentType || '—'}</AppText>,
      sortValue: (file) => file.fileExtension || file.contentType,
    },
    {
      id: 'created',
      header: t('platformTools.files.createdOn'),
      width: 190,
      render: (file) => <AppText variant="bodySmall">{formatPlatformDate(file.createdOn, i18n.language)}</AppText>,
      sortValue: (file) => new Date(file.createdOn),
    },
    {
      id: 'actions',
      header: t('platformTools.files.actions'),
      width: 120,
      align: 'center',
      render: (file) => (
        <View style={styles.rowActions}>
          <AppIconButton
            disabled={downloadingId === file.id}
            icon="download-outline"
            label={t('platformTools.files.download')}
            onPress={() => void download(file)}
          />
          <AppIconButton
            color={theme.colors.danger}
            disabled={deleteMutation.isPending}
            icon="trash-outline"
            label={t('platformTools.files.delete')}
            onPress={() => setPendingDelete(file)}
          />
        </View>
      ),
    },
  ], [deleteMutation.isPending, download, downloadingId, i18n.language, t, theme.colors.danger]);

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void filesQuery.refetch()}
          refreshing={filesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        action={(
          <AppIconButton
            color={theme.colors.onPrimary}
            disabled={uploadMutation.isPending}
            icon="cloud-upload-outline"
            label={t('platformTools.files.upload')}
            onPress={() => void pickAndUpload()}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
          />
        )}
        subtitle={t('platformTools.filesDescription')}
        title={t('navigation.files')}
      />

      {filesQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : filesQuery.error ? (
        <AppStateView
          message={getPlatformToolErrorMessage(filesQuery.error, t('states.errorMessage'))}
          onRetry={() => void filesQuery.refetch()}
          state="error"
        />
      ) : (
        <View style={styles.content}>
          <AppTextField
            compact
            label={t('platformTools.files.search')}
            leadingIcon="search-outline"
            onChangeText={setSearch}
            value={search}
          />
          <AppDataTable
            columns={columns}
            emptyMessage={t('platformTools.files.empty')}
            getRowKey={(file) => file.id || file.storedFileName}
            resetKey={search}
            rows={filteredFiles}
          />
        </View>
      )}

      <ConfirmationDialog
        confirmLabel={t('platformTools.files.delete')}
        description={t('platformTools.files.deleteDescription', {
          name: pendingDelete?.fileName ?? '',
        })}
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
        title={t('platformTools.files.deleteTitle')}
        tone="danger"
        visible={pendingDelete !== null}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  primaryAction: { flexShrink: 0 },
  rowActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
