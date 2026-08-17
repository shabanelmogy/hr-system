import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import type { StoredFile } from '@/src/features/platform-tools/types/platform-tools';
import { getFilePreviewKind } from '@/src/features/platform-tools/utils/file-manager';
import { AppIconButton } from '@/src/shared/components';

interface FileActionsProps {
  deleting: boolean;
  downloading: boolean;
  file: StoredFile;
  onDelete: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onView: (file: StoredFile) => void;
}

export function FileActions({
  deleting,
  downloading,
  file,
  onDelete,
  onDownload,
  onView,
}: FileActionsProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const opensExternally = getFilePreviewKind(file) === 'external';

  return (
    <View style={styles.actions}>
      <AppIconButton
        icon={opensExternally ? 'open-outline' : 'eye-outline'}
        label={t(opensExternally
          ? 'platformTools.files.viewer.openWithDevice'
          : 'platformTools.files.view')}
        onPress={() => onView(file)}
      />
      <AppIconButton
        disabled={downloading}
        icon="download-outline"
        label={t('platformTools.files.download')}
        onPress={() => onDownload(file)}
      />
      <AppIconButton
        color={theme.colors.danger}
        disabled={deleting}
        icon="trash-outline"
        label={t('platformTools.files.delete')}
        onPress={() => onDelete(file)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
