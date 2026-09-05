import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppStatusBadge, AppText } from '@/src/shared/components';
import { JobRequisitionDto, JobRequisitionStatus, RequisitionType } from '../types';

interface JobRequisitionCardProps {
  requisition: JobRequisitionDto;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onOpenOpening?: (req: JobRequisitionDto) => void;
}

export function JobRequisitionCard({
  requisition,
  onApprove,
  onReject,
  onOpenOpening,
}: JobRequisitionCardProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const isArabic = i18n.language.startsWith('ar');

  const positionTitle = isArabic ? requisition.positionTitleAr : requisition.positionTitleEn;
  const branchName = isArabic ? requisition.branchNameAr : requisition.branchNameEn;
  const departmentName = isArabic ? requisition.departmentNameAr : requisition.departmentNameEn;

  const getStatusColor = () => {
    switch (requisition.status) {
      case JobRequisitionStatus.Approved:
        return theme.colors.success;
      case JobRequisitionStatus.PendingApproval:
        return theme.colors.warning;
      case JobRequisitionStatus.Rejected:
        return theme.colors.danger;
      case JobRequisitionStatus.Fulfilled:
        return theme.colors.primary;
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusLabel = () => {
    switch (requisition.status) {
      case JobRequisitionStatus.Approved:
        return t('recruitment.status.approved', 'معتمد / Approved');
      case JobRequisitionStatus.PendingApproval:
        return t('recruitment.status.pending', 'قيد الاعتماد / Pending');
      case JobRequisitionStatus.Rejected:
        return t('recruitment.status.rejected', 'مرفوض / Rejected');
      case JobRequisitionStatus.Fulfilled:
        return t('recruitment.status.fulfilled', 'مكتمل / Fulfilled');
      default:
        return t('recruitment.status.draft', 'مسودة / Draft');
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
        },
      ]}
    >
      {/* Top row: Requisition number and status */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.codeBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
            <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>
              {requisition.requisitionNumber}
            </AppText>
          </View>
          <AppStatusBadge label={getStatusLabel()} color={getStatusColor()} />
        </View>

        {/* Headcount pill */}
        <View style={[styles.headcountPill, { backgroundColor: `${theme.colors.primary}15` }]}>
          <AppIcon name="people" size={14} color={theme.colors.primary} />
          <AppText variant="caption" weight="800" style={{ color: theme.colors.primary }}>
            {requisition.requestedPositions} {t('recruitment.openings.headcount', 'مقاعد')}
          </AppText>
        </View>
      </View>

      {/* Position Title */}
      <AppText variant="titleSmall" weight="800" style={styles.title}>
        {positionTitle}
      </AppText>

      {/* Org Location */}
      <View style={styles.metaRow}>
        <AppIcon name="business-outline" size={14} color={theme.colors.textMuted} />
        <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
          {departmentName} • {branchName}
        </AppText>
      </View>

      {/* Type & Budget Badges */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <View style={[styles.typePill, { backgroundColor: `${theme.colors.secondary}15` }]}>
          <AppText variant="caption" weight="700" style={{ color: theme.colors.secondary, fontSize: 11 }}>
            {requisition.type === RequisitionType.Replacement
              ? requisition.replacementEmployeeName
                ? `${t('recruitment.requisitions.replacementFor', 'إحلال:')} ${requisition.replacementEmployeeName}`
                : t('recruitment.requisitions.typeReplacement', 'إحلال / Replacement')
              : t('recruitment.requisitions.typeNewPosition', 'وظيفة جديدة')}
          </AppText>
        </View>

        <View
          style={[
            styles.typePill,
            {
              backgroundColor: requisition.isBudgeted
                ? `${theme.colors.success}15`
                : `${theme.colors.warning}20`,
            },
          ]}
        >
          <AppText
            variant="caption"
            weight="800"
            style={{
              color: requisition.isBudgeted ? theme.colors.success : theme.colors.warning,
              fontSize: 11,
            }}
          >
            {requisition.isBudgeted
              ? t('recruitment.requisitions.budgeted', 'مدرج بالموازنة')
              : t('recruitment.requisitions.unbudgeted', 'غير مدرج بالموازنة')}
          </AppText>
        </View>
      </View>

      {/* Business Reason snippet */}
      {Boolean(requisition.businessReason) && (
        <View style={[styles.reasonBox, { backgroundColor: theme.colors.surfaceMuted }]}>
          <AppText variant="caption" numberOfLines={2} style={{ color: theme.colors.text }}>
            {requisition.businessReason}
          </AppText>
        </View>
      )}

      {/* Unbudgeted justification */}
      {!requisition.isBudgeted && Boolean(requisition.budgetJustification) && (
        <View style={[styles.reasonBox, { backgroundColor: `${theme.colors.warning}15`, borderColor: theme.colors.warning, borderWidth: 1 }]}>
          <AppText variant="caption" weight="700" style={{ color: theme.colors.warning }}>
            {t('recruitment.requisitions.budgetJustificationShort', 'مبرر الموازنة:')} {requisition.budgetJustification}
          </AppText>
        </View>
      )}

      {/* Action buttons */}
      <View style={[styles.actionRow, { borderTopColor: theme.colors.border }]}>
        {requisition.status === JobRequisitionStatus.Approved && onOpenOpening && (
          <Pressable
            onPress={() => onOpenOpening(requisition)}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <AppIcon name="briefcase" size={14} color="#fff" />
            <AppText variant="caption" weight="700" style={{ color: '#fff' }}>
              {t('recruitment.requisitions.openOpeningBtn', 'فتح شاغر وظيفي')}
            </AppText>
          </Pressable>
        )}

        {requisition.status === JobRequisitionStatus.PendingApproval && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {onApprove && (
              <Pressable
                onPress={() => onApprove(requisition.id)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: theme.colors.success,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <AppIcon name="checkmark" size={14} color="#fff" />
                <AppText variant="caption" weight="700" style={{ color: '#fff' }}>
                  {t('common.approve', 'اعتماد')}
                </AppText>
              </Pressable>
            )}

            {onReject && (
              <Pressable
                onPress={() => onReject(requisition.id)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: theme.colors.danger ?? '#EF4444',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <AppIcon name="close" size={14} color="#fff" />
                <AppText variant="caption" weight="700" style={{ color: '#fff' }}>
                  {t('common.reject', 'رفض')}
                </AppText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headcountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  title: {
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  reasonBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
