import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { fileManagerApi } from '@/src/features/platform-tools/file-manager/api';
import { FileActions } from '@/src/features/platform-tools/file-manager/components/FileActions';
import { FileViewerModal } from '@/src/features/platform-tools/file-manager/components/FileViewerModal';
import { GroupedFilesView } from '@/src/features/platform-tools/file-manager/components/GroupedFilesView';
import {
  useDeleteFile,
  useStoredFiles,
  useUploadFiles,
} from '@/src/features/platform-tools/file-manager/hooks';
import type { StoredFile, UploadFileAsset } from '@/src/features/platform-tools/file-manager/types';
import {
  classifyFile,
  fileGroupDefinitions,
  type FileGroupId,
  getFileIcon,
} from '@/src/features/platform-tools/file-manager/file-utils';
import {
  formatPlatformDate,
  getPlatformToolErrorMessage,
} from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppIcon,
  AppIconButton,
  AppListScreen,
  type AppMultiViewDefinition,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';

type FileManagerView = 'list' | 'grouped';

export function FileManagerScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const filesQuery = useStoredFiles();
  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const [selectedFilters, setSelectedFilters] = useState<FileGroupId[]>([]);
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);
  const [viewerFile, setViewerFile] = useState<StoredFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const files = useMemo(() => filesQuery.data ?? [], [filesQuery.data]);
  const fileFilterOptions = useMemo(
    () => fileGroupDefinitions.map((definition) => ({
      icon: definition.icon,
      label: t(definition.labelKey),
      value: definition.id,
    })),
    [t],
  );
  const filteredFiles = useMemo(() => {
    const searchMatches = files;
    return selectedFilters.length === 0
      ? searchMatches
      : searchMatches.filter((file) => selectedFilters.includes(classifyFile(file)));
  }, [files, selectedFilters]);

  const searchFiles = useCallback(
    (items: readonly StoredFile[], searchTerm: string) => {
      const term = searchTerm.trim().toLocaleLowerCase(i18n.language);
      if (!term) return items;
      return items.filter((file) => [file.fileName, file.fileExtension, file.contentType]
        .some((value) => value.toLocaleLowerCase(i18n.language).includes(term)));
    },
    [i18n.language],
  );

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
      await fileManagerApi.downloadFile(file);
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
      render: (file) => (
        <View style={styles.fileName}>
          <AppIcon color={theme.colors.primary} name={getFileIcon(file)} size={20} />
          <AppText numberOfLines={2} variant="bodySmall">{file.fileName}</AppText>
        </View>
      ),
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
      width: 160,
      align: 'center',
      render: (file) => (
        <FileActions
          deleting={deleteMutation.isPending}
          downloading={downloadingId === file.id}
          file={file}
          onDelete={setPendingDelete}
          onDownload={(selectedFile) => void download(selectedFile)}
          onView={setViewerFile}
        />
      ),
    },
  ], [
    deleteMutation.isPending,
    download,
    downloadingId,
    i18n.language,
    t,
    theme.colors.primary,
  ]);

  const views = useMemo<readonly AppMultiViewDefinition<StoredFile, FileManagerView>[]>(
    () => [
      {
        icon: 'list-outline',
        label: t('platformTools.files.views.list'),
        paginate: false,
        value: 'list',
        render: (items) => (
          <AppDataTable
            columns={columns}
            defaultPageSize={5}
            emptyMessage={t('platformTools.files.empty')}
            getRowKey={(file) => file.id || file.storedFileName}
            rows={items}
          />
        ),
      },
      {
        icon: 'folder-open-outline',
        label: t('platformTools.files.views.grouped'),
        paginate: false,
        value: 'grouped',
        render: (items) => (
          <GroupedFilesView
            deleting={deleteMutation.isPending}
            downloadingId={downloadingId}
            files={items}
            onDelete={setPendingDelete}
            onDownload={(selectedFile) => void download(selectedFile)}
            onView={setViewerFile}
            visibleGroupIds={selectedFilters}
          />
        ),
      },
    ],
    [
      columns,
      deleteMutation.isPending,
      download,
      downloadingId,
      selectedFilters,
      t,
    ],
  );

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
          message={getPlatformToolErrorMessage(filesQuery.error, t('feedback.unknownError'))}
          onRetry={() => void filesQuery.refetch()}
          state="error"
        />
      ) : (
        <AppListScreen<StoredFile, FileManagerView, FileGroupId>
          defaultView="list"
          emptyContent={(
            <AppStateView message={t('platformTools.files.empty')} state="empty" />
          )}
          filter={{
            options: fileFilterOptions,
            values: selectedFilters,
            onChange: setSelectedFilters,
            modalTitle: t('platformTools.files.filterTitle'),
            description: t('platformTools.files.filterDescription'),
            applyLabel: t('platformTools.files.applyFilters'),
          }}
          items={filteredFiles}
          onSearch={searchFiles}
          searchPlaceholder={t('platformTools.files.search')}
          showViewLabels
          views={views}
        />
      )}

      {viewerFile ? (
        <FileViewerModal file={viewerFile} onClose={() => setViewerFile(null)} />
      ) : null}

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
  primaryAction: { flexShrink: 0 },
  fileName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
