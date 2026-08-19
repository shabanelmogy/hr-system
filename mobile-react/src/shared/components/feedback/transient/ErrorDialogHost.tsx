import Constants from 'expo-constants';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { Platform, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

import {
  dismissErrorDialog,
  getErrorDialogSnapshot,
  subscribeToErrorDialog,
} from './errorDialogStore';
import { formatErrorReport } from './formatErrorReport';
import type { ErrorDialogDetails } from './types';

const getServerSnapshot = () => null;

export function ErrorDialogHost() {
  const details = useSyncExternalStore(
    subscribeToErrorDialog,
    getErrorDialogSnapshot,
    getServerSnapshot,
  );

  if (!details) return null;
  return <ErrorDialogView key={details.reportId} details={details} />;
}

function ErrorDialogView({ details }: { details: ErrorDialogDetails }) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { resolvedMode, theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const [shareFailed, setShareFailed] = useState(false);
  const messages = useMemo(
    () =>
      details.messages.length
        ? details.messages
        : [t('feedback.unknownError')],
    [details.messages, t],
  );
  const report = useMemo(
    () =>
      formatErrorReport(
        { ...details, messages },
        {
          heading: t('feedback.errorReport'),
          includeTechnical: __DEV__,
          appVersion: Constants.expoConfig?.version,
          language: i18n.language,
          direction,
          theme: resolvedMode,
          platform: `${Platform.OS} ${String(Platform.Version)}`,
          screen: `${Math.round(width)}x${Math.round(height)}`,
        },
      ),
    [details, direction, height, i18n.language, messages, resolvedMode, t, width],
  );
  const technicalDetails = useMemo(
    () => getTechnicalDetails(details),
    [details],
  );
  const close = () => dismissErrorDialog(details.reportId);

  const share = async () => {
    setShareFailed(false);
    try {
      await Share.share(
        { message: report, title: t('feedback.errorReport') },
        { dialogTitle: t('feedback.shareError') },
      );
    } catch {
      setShareFailed(true);
    }
  };

  return (
    <AppModal
      animationType="fade"
      footer={
        <View style={[styles.actions, { direction, borderTopColor: theme.colors.border }]}>
          <AppButton icon="close-outline" onPress={close} variant="outline">
            {t('feedback.close')}
          </AppButton>
          <AppButton icon="share-social-outline" onPress={() => void share()}>
            {t('feedback.share')}
          </AppButton>
        </View>
      }
      icon="alert-circle-outline"
      onClose={close}
      closeLabel={t('feedback.close')}
      subtitle={t('feedback.errorSubtitle')}
      title={details.title || t('feedback.errorTitle')}
      visible>
      <View style={styles.content}>
        <View style={styles.messages} accessibilityLiveRegion="assertive">
          {messages.map((message, index) => (
            <View key={`${index}-${message}`} style={[styles.messageRow, { direction }]}>
              <AppIcon color={theme.colors.danger} name="ellipse" size={8} />
              <AppText style={styles.messageText}>{message}</AppText>
            </View>
          ))}
        </View>

        <View style={[styles.support, { backgroundColor: theme.colors.surfaceMuted }]}>
          <SupportLine label={t('feedback.reportId')} value={details.reportId} />
          {details.status != null ? (
            <SupportLine label={t('feedback.status')} value={String(details.status)} />
          ) : null}
          {details.traceId ? (
            <SupportLine label={t('feedback.traceId')} value={details.traceId} />
          ) : null}
          {details.correlationId ? (
            <SupportLine
              label={t('feedback.correlationId')}
              value={details.correlationId}
            />
          ) : null}
        </View>

        {__DEV__ && technicalDetails ? (
          <View style={[styles.technical, { borderColor: theme.colors.warning }]}>
            <AppText color="warning" variant="label">
              {t('feedback.technicalDetails')}
            </AppText>
            <AppText selectable color="muted" style={styles.technicalText} variant="caption">
              {technicalDetails}
            </AppText>
          </View>
        ) : null}

        {shareFailed ? (
          <AppText accessibilityRole="alert" color="danger" variant="bodySmall">
            {t('feedback.shareFailed')}
          </AppText>
        ) : null}
      </View>
    </AppModal>
  );
}

function SupportLine({ label, value }: { label: string; value: string }) {
  return (
    <AppText selectable color="muted" variant="caption">
      {label}: {value}
    </AppText>
  );
}

function getTechnicalDetails(details: ErrorDialogDetails): string {
  const lines: string[] = [];
  if (details.errorType) lines.push(`Type: ${details.errorType}`);
  if (details.errorCodes?.length) lines.push(`Codes: ${details.errorCodes.join(', ')}`);
  if (details.detail && !details.messages.includes(details.detail)) {
    lines.push(`Detail: ${details.detail}`);
  }
  if (details.stack) lines.push(`Stack: ${details.stack}`);
  return lines.join('\n');
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 2,
  },
  messages: {
    gap: 9,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  messageText: {
    flex: 1,
  },
  support: {
    gap: 5,
    padding: 12,
    borderRadius: 6,
  },
  technical: {
    gap: 7,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  technicalText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
});
