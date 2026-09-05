import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppText } from '@/src/shared/components';
import type { RecruitmentSummaryDto } from '../types';

interface RecruitmentSummaryStatsProps {
  summary?: RecruitmentSummaryDto;
  isLoading?: boolean;
}

export function RecruitmentSummaryStats({ summary }: RecruitmentSummaryStatsProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const items = [
    {
      title: t('recruitment.stats.openings', 'الوظائف المفتوحة / Openings'),
      count: summary?.totalOpenings ?? 0,
      icon: 'briefcase-outline' as const,
      color: theme.colors.primary,
      bgColor: `${theme.colors.primary}15`,
    },
    {
      title: t('recruitment.stats.candidates', 'المرشحون / Candidates'),
      count: summary?.totalActiveCandidates ?? 0,
      icon: 'people-outline' as const,
      color: '#8B5CF6',
      bgColor: '#8B5CF615',
    },
    {
      title: t('recruitment.stats.interviews', 'المقابلات / Interviews'),
      count: summary?.scheduledInterviewsCount ?? 0,
      icon: 'calendar-outline' as const,
      color: '#F59E0B',
      bgColor: '#F59E0B15',
    },
    {
      title: t('recruitment.stats.offers', 'عروض العمل / Offers'),
      count: summary?.pendingOffersCount ?? 0,
      icon: 'mail-outline' as const,
      color: '#06B6D4',
      bgColor: '#06B6D415',
    },
    {
      title: t('recruitment.stats.hired', 'تم التعيين / Hired'),
      count: summary?.totalHiredCount ?? 0,
      icon: 'checkmark-circle-outline' as const,
      color: theme.colors.success,
      bgColor: `${theme.colors.success}15`,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
            <AppIcon name={item.icon} size={20} color={item.color} />
          </View>
          <View style={styles.textWrapper}>
            <AppText variant="titleSmall" weight="800" style={{ color: item.color }}>
              {item.count}
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.textMuted }} numberOfLines={1}>
              {item.title}
            </AppText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 140,
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    justifyContent: 'center',
  },
});
