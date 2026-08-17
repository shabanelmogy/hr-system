import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { FileActions } from '@/src/features/platform-tools/components/FileActions';
import type { StoredFile } from '@/src/features/platform-tools/types/platform-tools';
import {
  type FileGroupId,
  getFileIcon,
  groupFiles,
} from '@/src/features/platform-tools/utils/file-manager';
import { formatPlatformDate } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppCard,
  AppCollectionPagination,
  AppIcon,
  AppIconButton,
  AppText,
} from '@/src/shared/components';

interface GroupedFilesViewProps {
  deleting: boolean;
  downloadingId: string | null;
  files: readonly StoredFile[];
  visibleGroupIds?: readonly FileGroupId[];
  onDelete: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onView: (file: StoredFile) => void;
}

const pageSizeOptions = [5, 10, 25] as const;

export function GroupedFilesView({
  deleting,
  downloadingId,
  files,
  visibleGroupIds = [],
  onDelete,
  onDownload,
  onView,
}: GroupedFilesViewProps) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<FileGroupId | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const groups = useMemo(() => {
    const allGroups = groupFiles(files);
    return visibleGroupIds.length === 0
      ? allGroups
      : allGroups.filter((group) => visibleGroupIds.includes(group.id));
  }, [files, visibleGroupIds]);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const pageCount = Math.max(1, Math.ceil((selectedGroup?.files.length ?? 0) / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageFiles = selectedGroup?.files.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  ) ?? [];
  const internalScrollHeight = Math.max(240, Math.min(viewportHeight * 0.38, 480));

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
  }, [pageSize, safePage, selectedGroupId, visibleGroupIds]);

  if (!selectedGroup) {
    return (
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.groupGrid}
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={[styles.internalScroll, { maxHeight: internalScrollHeight }]}>
        {groups.map((group) => (
          <Pressable
            accessibilityRole="button"
            key={group.id}
            onPress={() => {
              setSelectedGroupId(group.id);
              setPage(0);
            }}
            style={({ pressed }) => [styles.groupItem, { opacity: pressed ? 0.75 : 1 }]}>
            <AppCard padding="sm" style={styles.groupCard}>
              <View
                style={[
                  styles.groupIcon,
                  { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md },
                ]}>
                <AppIcon color={theme.colors.primary} name={group.icon} size={32} />
              </View>
              <View style={styles.groupDetails}>
                <AppText align="center" numberOfLines={2} variant="label" weight="800">
                  {t(group.labelKey)}
                </AppText>
                <AppText align="center" color="muted" variant="caption">
                  {t('platformTools.files.fileCount', { count: group.files.length })}
                </AppText>
              </View>
            </AppCard>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.selectedGroup}>
      <View style={[styles.groupHeader, { direction }]}>
        <AppIconButton
          icon={direction === 'rtl' ? 'arrow-forward-outline' : 'arrow-back-outline'}
          label={t('platformTools.files.backToGroups')}
          onPress={() => setSelectedGroupId(null)}
        />
        <View style={styles.groupTitle}>
          <AppText variant="titleSmall">{t(selectedGroup.labelKey)}</AppText>
          <AppText color="muted" variant="caption">
            {t('platformTools.files.fileCount', { count: selectedGroup.files.length })}
          </AppText>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={pageFiles.length === 0 ? styles.emptyContent : styles.fileGrid}
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={[
          styles.internalScroll,
          pageFiles.length === 0 && { borderColor: theme.colors.border, borderWidth: 1 },
          { maxHeight: internalScrollHeight },
        ]}>
        {pageFiles.length === 0 ? (
          <AppText align="center" color="muted">
            {t('platformTools.files.emptyGroup')}
          </AppText>
        ) : pageFiles.map((file) => (
            <AppCard key={file.id || file.storedFileName} style={styles.fileCard}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onView(file)}
                style={styles.fileMain}>
                <View
                  style={[
                    styles.fileIcon,
                    { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                  ]}>
                  <AppIcon color={theme.colors.primary} name={getFileIcon(file)} size={25} />
                </View>
                <View style={styles.fileDetails}>
                  <AppText numberOfLines={2} variant="bodySmall" weight="700">
                    {file.fileName}
                  </AppText>
                  <AppText color="muted" numberOfLines={1} variant="caption">
                    {formatPlatformDate(file.createdOn, i18n.language)}
                  </AppText>
                </View>
              </Pressable>
              <FileActions
                deleting={deleting}
                downloading={downloadingId === file.id}
                file={file}
                onDelete={onDelete}
                onDownload={onDownload}
                onView={onView}
              />
            </AppCard>
          ))}
      </ScrollView>

      {selectedGroup.files.length > 0 ? (
        <AppCollectionPagination
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(0);
          }}
          page={safePage}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          totalItems={selectedGroup.files.length}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupItem: { width: '48%', minWidth: 150, flexGrow: 1 },
  groupCard: { minHeight: 138, alignItems: 'center', justifyContent: 'center', gap: 10 },
  groupIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  groupDetails: { width: '100%', minWidth: 0, alignItems: 'center', gap: 3 },
  selectedGroup: { gap: 12 },
  groupHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { flex: 1, gap: 2 },
  fileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fileCard: { width: '48%', minWidth: 158, flexGrow: 1, gap: 10 },
  fileMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  fileDetails: { flex: 1, minWidth: 0, gap: 3 },
  internalScroll: { width: '100%' },
  emptyContent: { minHeight: 150, alignItems: 'center', justifyContent: 'center' },
});
