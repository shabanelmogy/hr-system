import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { fileManagerApi } from '@/src/features/platform-tools/file-manager/api';
import type {
  AuthenticatedFileSource,
  PreparedFilePreview,
  StoredFile,
} from '@/src/features/platform-tools/file-manager/types';
import {
  getFileIcon,
  getFilePreviewKind,
} from '@/src/features/platform-tools/file-manager/file-utils';
import { formatFileSize } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppIconButton,
  AppModal,
  AppStateView,
  AppText,
  showToast,
} from '@/src/shared/components';

interface FileViewerModalProps {
  file: StoredFile;
  onClose: () => void;
}

const maxTextPreviewSize = 2 * 1024 * 1024;

export function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [preview, setPreview] = useState<PreparedFilePreview | null>(null);
  const [mediaSource, setMediaSource] = useState<AuthenticatedFileSource | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textTooLarge, setTextTooLarge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [opening, setOpening] = useState(false);
  const previewKind = getFilePreviewKind(file);

  useEffect(() => {
    let active = true;
    let prepared: PreparedFilePreview | null = null;

    const load = async () => {
      setPreview(null);
      setMediaSource(null);
      setTextContent(null);
      setTextTooLarge(false);
      setError(null);

      try {
        if (previewKind === 'image' || previewKind === 'video' || previewKind === 'audio') {
          const source = await fileManagerApi.getAuthenticatedFileSource(file);
          if (active) setMediaSource(source);
          return;
        }

        if (previewKind === 'external') return;

        prepared = await fileManagerApi.prepareFilePreview(file);
        if (!active) {
          prepared.dispose();
          return;
        }

        if (previewKind === 'text') {
          if (prepared.size > maxTextPreviewSize) {
            setTextTooLarge(true);
          } else {
            setTextContent(await prepared.readText());
          }
        }

        if (active) setPreview(prepared);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error
            ? loadError.message
            : t('platformTools.files.viewer.loadFailed'));
        }
      }
    };

    void load();
    return () => {
      active = false;
      prepared?.dispose();
    };
  }, [file, previewKind, retryKey, t]);

  const openWithDevice = async () => {
    setOpening(true);
    try {
      if (preview) {
        await fileManagerApi.openPreparedFile(file, preview);
      } else {
        await fileManagerApi.downloadFile(file);
      }
    } catch (openError) {
      showToast.error(openError, t('platformTools.files.viewer.openFailed'));
    } finally {
      setOpening(false);
    }
  };

  const footer = (
    <View style={styles.footer}>
      <AppButton
        fullWidth
        icon={previewKind === 'external' || textTooLarge ? 'open-outline' : 'download-outline'}
        loading={opening}
        onPress={() => void openWithDevice()}
        variant="outline">
        {t(previewKind === 'external' || textTooLarge
          ? 'platformTools.files.viewer.openWithDevice'
          : 'platformTools.files.download')}
      </AppButton>
    </View>
  );

  return (
    <AppModal
      closeLabel={t('common.close')}
      contentContainerStyle={styles.modalContent}
      footer={footer}
      icon={getFileIcon(file)}
      onClose={onClose}
      scrollable={false}
      subtitle={file.fileExtension || file.contentType || t('platformTools.files.viewer.unknownType')}
      title={file.fileName}
      variant="fullScreen"
      visible>
      {!preview && !mediaSource && previewKind !== 'external' && !error ? (
        <AppStateView
          message={t('platformTools.files.viewer.loading')}
          state="loading"
        />
      ) : error ? (
        <AppStateView
          message={error}
          onRetry={() => setRetryKey((current) => current + 1)}
          state="error"
        />
      ) : preview || mediaSource || previewKind === 'external' ? (
        <View style={styles.viewer}>
          {previewKind === 'image' && mediaSource ? (
            <Image
              accessibilityLabel={file.fileName}
              contentFit="contain"
              source={mediaSource}
              style={[styles.media, { backgroundColor: theme.colors.surfaceMuted }]}
            />
          ) : previewKind === 'video' && mediaSource ? (
            <VideoPreview source={mediaSource} />
          ) : previewKind === 'audio' && mediaSource ? (
            <AudioPreview fileName={file.fileName} source={mediaSource} />
          ) : previewKind === 'text' && !textTooLarge ? (
            <TextPreview content={textContent ?? ''} />
          ) : (
            <ExternalPreview file={file} size={preview?.size ?? null} textTooLarge={textTooLarge} />
          )}
        </View>
      ) : null}
    </AppModal>
  );
}

function VideoPreview({ source }: { source: AuthenticatedFileSource }) {
  const streamingSource = useMemo(() => ({
    ...source,
    contentType: 'progressive' as const,
    useCaching: false,
  }), [source]);
  const player = useVideoPlayer(streamingSource, (videoPlayer) => {
    videoPlayer.play();
  });

  return (
    <VideoView
      allowsFullscreen
      contentFit="contain"
      nativeControls
      player={player}
      style={styles.media}
      surfaceType="textureView"
    />
  );
}

function AudioPreview({
  fileName,
  source,
}: {
  fileName: string;
  source: AuthenticatedFileSource;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0
    ? Math.min(1, Math.max(0, status.currentTime / status.duration))
    : 0;
  const togglePlayback = useCallback(() => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish) player.seekTo(0);
    player.play();
  }, [player, status.didJustFinish, status.playing]);

  return (
    <AppCard style={styles.audioCard} variant="filled">
      <View
        style={[
          styles.audioArtwork,
          { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full },
        ]}>
        <AppIcon color={theme.colors.onPrimary} name="musical-notes" size={54} />
      </View>
      <AppText align="center" numberOfLines={2} variant="titleSmall">
        {fileName}
      </AppText>
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressValue,
            { backgroundColor: theme.colors.primary, width: `${progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.audioTimes}>
        <AppText color="muted" variant="caption">{formatDuration(status.currentTime)}</AppText>
        <AppText color="muted" variant="caption">{formatDuration(status.duration)}</AppText>
      </View>
      <AppIconButton
        color={theme.colors.onPrimary}
        disabled={!status.isLoaded}
        icon={status.playing ? 'pause' : 'play'}
        label={t(status.playing
          ? 'platformTools.files.viewer.pause'
          : 'platformTools.files.viewer.play')}
        onPress={togglePlayback}
        size={34}
        style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
      />
    </AppCard>
  );
}

function TextPreview({ content }: { content: string }) {
  const { theme } = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.textContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator>
      <AppText
        selectable
        style={[
          styles.code,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}>
        {content}
      </AppText>
    </ScrollView>
  );
}

function ExternalPreview({
  file,
  size,
  textTooLarge,
}: {
  file: StoredFile;
  size: number | null;
  textTooLarge: boolean;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  return (
    <View style={styles.externalPreview}>
      <View
        style={[
          styles.externalIcon,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
        ]}>
        <AppIcon color={theme.colors.primary} name={getFileIcon(file)} size={58} />
      </View>
      <AppText align="center" variant="titleSmall">
        {t(textTooLarge
          ? 'platformTools.files.viewer.textTooLargeTitle'
          : 'platformTools.files.viewer.deviceViewerTitle')}
      </AppText>
      <AppText align="center" color="muted">
        {t(textTooLarge
          ? 'platformTools.files.viewer.textTooLargeDescription'
          : 'platformTools.files.viewer.deviceViewerDescription')}
      </AppText>
      {size != null ? (
        <AppText color="muted" variant="caption">{formatFileSize(size)}</AppText>
      ) : null}
    </View>
  );
}

function formatDuration(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  modalContent: { flex: 1, minHeight: 0, paddingBottom: 0 },
  viewer: { flex: 1, minHeight: 0 },
  media: { flex: 1, width: '100%', minHeight: 240 },
  footer: { flexDirection: 'row', width: '100%' },
  audioCard: {
    flex: 1,
    maxHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 18,
  },
  audioArtwork: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { width: '100%', height: 5, overflow: 'hidden', borderRadius: 3 },
  progressValue: { height: '100%' },
  audioTimes: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  playButton: { width: 64, height: 64, borderRadius: 32 },
  textContent: { paddingBottom: 24 },
  code: {
    minHeight: 240,
    borderWidth: 1,
    padding: 14,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  externalPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  externalIcon: { width: 126, height: 126, alignItems: 'center', justifyContent: 'center' },
});
