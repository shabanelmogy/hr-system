import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppStatusBadge, AppText } from '@/src/shared/components';
import { JobOpeningDto, JobOpeningStatus } from '../types';

interface JobOpeningCardProps {
  opening: JobOpeningDto;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onOpen?: (id: number) => void;
  onPause?: (id: number) => void;
  onClose?: (id: number) => void;
}

export function JobOpeningCard({
  opening,
  isSelected,
  onSelect,
  onOpen,
  onPause,
  onClose,
}: JobOpeningCardProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const isArabic = i18n.language.startsWith('ar');

  const positionTitle = isArabic ? opening.positionTitleAr : opening.positionTitleEn;
  const branchName = isArabic ? opening.branchNameAr : opening.branchNameEn;
  const departmentName = isArabic ? opening.departmentNameAr : opening.departmentNameEn;

  const progressPercent =
    opening.positionCount > 0
      ? Math.min(100, Math.round((opening.hiredCount / opening.positionCount) * 100))
      : 0;

  const getStatusColor = () => {
    switch (opening.status) {
      case JobOpeningStatus.Open:
        return theme.colors.success;
      case JobOpeningStatus.Paused:
        return theme.colors.warning;
      case JobOpeningStatus.Closed:
        return theme.colors.textMuted;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusLabel = () => {
    switch (opening.status) {
      case JobOpeningStatus.Open:
        return t('recruitment.status.open', 'مفتوح / Open');
      case JobOpeningStatus.Paused:
        return t('recruitment.status.paused', 'معلق / Paused');
      case JobOpeningStatus.Closed:
        return t('recruitment.status.closed', 'مغلق / Closed');
      default:
        return t('recruitment.status.draft', 'مسودة / Draft');
    }
  };

  return (
    <Pressable
      onPress={() => onSelect?.(opening.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Top row: opening number and status */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.codeBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
            <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>
              {opening.openingNumber}
            </AppText>
          </View>
          <AppStatusBadge label={getStatusLabel()} color={getStatusColor()} />
        </View>

        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
            <AppIcon name="checkmark-circle" size={16} color={theme.colors.primary} />
            <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>
              {t('recruitment.pipeline.selected', 'محدد / Filtered')}
            </AppText>
          </View>
        )}
      </View>

      {/* Position Title */}
      <AppText variant="titleSmall" weight="800" style={styles.title}>
        {positionTitle}
      </AppText>

      {/* Department & Branch */}
      <View style={styles.metaRow}>
        <AppIcon name="business-outline" size={14} color={theme.colors.textMuted} />
        <AppText variant="bodySmall" style={{ color: theme.colors.textMuted }}>
          {branchName} • {departmentName}
        </AppText>
      </View>

      {/* Hiring Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
            {t('recruitment.openings.hiredProgress', 'تم تعيين:')} {opening.hiredCount} / {opening.positionCount}
          </AppText>
          <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>
            {progressPercent}%
          </AppText>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  progressPercent >= 100 ? theme.colors.success : theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom row: Applicants count & Quick actions */}
      <View style={styles.bottomRow}>
        <View style={styles.applicantsInfo}>
          <AppIcon name="people-outline" size={16} color={theme.colors.primary} />
          <AppText variant="bodySmall" weight="700" style={{ color: theme.colors.primary }}>
            {opening.activeApplicationsCount}{' '}
            {t('recruitment.openings.applicationsCount', 'متقدم / Applicants')}
          </AppText>
        </View>

        {Boolean(onOpen || onPause || onClose) && (
          <View style={styles.actionsRow}>
            {onOpen && opening.status !== JobOpeningStatus.Open && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onOpen(opening.id);
                }}
                style={[styles.actionBtn, { backgroundColor: `${theme.colors.success}15` }]}
              >
                <AppIcon name="play-outline" size={16} color={theme.colors.success} />
              </Pressable>
            )}

            {onPause && opening.status === JobOpeningStatus.Open && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onPause(opening.id);
                }}
                style={[styles.actionBtn, { backgroundColor: `${theme.colors.warning}15` }]}
              >
                <AppIcon name="pause-outline" size={16} color={theme.colors.warning} />
              </Pressable>
            )}

            {onClose && opening.status !== JobOpeningStatus.Closed && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onClose(opening.id);
                }}
                style={[styles.actionBtn, { backgroundColor: `${theme.colors.danger ?? '#EF4444'}15` }]}
              >
                <AppIcon name="close-circle-outline" size={16} color={theme.colors.danger ?? '#EF4444'} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  title: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSection: {
    marginTop: 4,
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000010',
  },
  applicantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
