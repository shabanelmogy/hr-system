import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import {
  AppButton,
  AppDivider,
  AppIcon,
  AppIconButton,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';
import type { OrganizationalStructureItem } from '../types/organizational-structure';
import { canDecideJobDescription, getJobDescriptionStatusKey } from '../utils/job-description-status';

interface Props {
  visible: boolean;
  item: OrganizationalStructureItem | null;
  canEdit?: boolean;
  canApprove?: boolean;
  onClose: () => void;
  onEdit?: (item: OrganizationalStructureItem) => void;
  onApprove?: (item: OrganizationalStructureItem) => void;
  onReject?: (item: OrganizationalStructureItem) => void;
  onViewLogs?: (item: OrganizationalStructureItem) => void;
}

export function JobDescriptionDetailsModal({
  visible,
  item,
  canEdit = false,
  canApprove = false,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onViewLogs,
}: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const isAr = i18n.language?.startsWith('ar');

  if (!item) return null;

  const statusKey = getJobDescriptionStatusKey(item) ?? 'draft';
  const isDraft = statusKey === 'draft';
  const duties = item.dutySections ?? [];
  const skills = item.skills ?? [];
  const education = item.educationRequirements ?? [];

  const statusColor = item.isDeleted
    ? theme.colors.warning
    : statusKey === 'approved'
      ? theme.colors.success
      : statusKey === 'rejected'
        ? theme.colors.danger
        : theme.colors.primary;

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  ];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerTitleContainer}>
            <AppText variant="caption" color="muted">
              {t('organizationalStructure.jobDescriptionDetails.profileTitle')}
            </AppText>
            <AppText variant="title" numberOfLines={1}>
              {isAr ? item.nameAr : item.nameEn}
            </AppText>
          </View>
          <AppIconButton
            icon="close-outline"
            label={t('common.close')}
            onPress={onClose}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Main Identity Banner */}
          <View style={cardStyle}>
            <View style={styles.badgesRow}>
              <AppStatusBadge
                color={theme.colors.primary}
                label={`v${item.version ?? item.code}`}
              />
              <AppStatusBadge
                color={statusColor}
                label={t(`organizationalStructure.jobDescriptionStatus.${statusKey}`)}
              />
            </View>

            <AppText variant="titleSmall" style={styles.mainTitle}>
              {isAr ? item.nameAr : item.nameEn}
            </AppText>
            <AppText variant="bodySmall" color="muted">
              {isAr ? item.nameEn : item.nameAr}
            </AppText>

            <AppDivider style={styles.divider} />

            <View style={styles.metaRow}>
              <AppIcon name="business-outline" size={16} color={theme.colors.textMuted} />
              <AppText variant="caption" color="muted" style={styles.metaText}>
                {item.positionCode ? `${item.positionCode} — ` : ''}
                {item.branchNameAr || item.branchNameEn || t('organizationalStructure.currentCompany')}
              </AppText>
            </View>
            {item.departmentNameAr && (
              <View style={styles.metaRow}>
                <AppIcon name="git-branch-outline" size={16} color={theme.colors.textMuted} />
                <AppText variant="caption" color="muted" style={styles.metaText}>
                  {item.departmentNameAr} / {item.departmentNameEn}
                </AppText>
              </View>
            )}
          </View>

          {/* 1. Job Purpose */}
          {(item.purposeAr || item.purposeEn) && (
            <View style={cardStyle}>
              <View style={styles.sectionHeader}>
                <AppIcon name="briefcase-outline" size={18} color={theme.colors.primary} />
                <AppText variant="label" style={styles.sectionTitle}>
                  {t('organizationalStructure.jobDescriptionDetails.overview')}
                </AppText>
              </View>
              {item.purposeAr && (
                <AppText variant="body" style={styles.purposeText}>
                  {item.purposeAr}
                </AppText>
              )}
              {item.purposeEn && (
                <AppText variant="bodySmall" color="muted" style={styles.purposeTextEn}>
                  {item.purposeEn}
                </AppText>
              )}
            </View>
          )}

          {/* 2. Structured Duty Sections */}
          <View style={cardStyle}>
            <View style={styles.sectionHeader}>
              <AppIcon name="list-outline" size={18} color={theme.colors.primary} />
              <AppText variant="label" style={styles.sectionTitle}>
                {t('organizationalStructure.jobDescriptionDetails.duties')}
              </AppText>
            </View>

            {duties.length === 0 ? (
              item.responsibilitiesAr || item.responsibilitiesEn ? (
                <View style={styles.legacyTextContainer}>
                  {item.responsibilitiesAr && (
                    <AppText variant="body">{item.responsibilitiesAr}</AppText>
                  )}
                  {item.responsibilitiesEn && (
                    <AppText variant="bodySmall" color="muted">{item.responsibilitiesEn}</AppText>
                  )}
                </View>
              ) : (
                <AppText variant="caption" color="muted">
                  {t('organizationalStructure.jobDescriptionDetails.emptyDuties')}
                </AppText>
              )
            ) : (
              <View style={styles.sectionsList}>
                {duties.map((sec, sIdx) => (
                  <View
                    key={sIdx}
                    style={[
                      styles.sectionItem,
                      { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                    ]}
                  >
                    <View style={styles.sectionItemHeader}>
                      <AppText variant="label" style={styles.sectionItemTitle}>
                        {sIdx + 1}. {isAr ? sec.sectionTitleAr || sec.sectionTitleEn : sec.sectionTitleEn || sec.sectionTitleAr}
                      </AppText>
                      {sec.weightPercentage != null && (
                        <AppStatusBadge
                          color={theme.colors.primary}
                          label={`${sec.weightPercentage}%`}
                        />
                      )}
                    </View>

                    {sec.items && sec.items.length > 0 && (
                      <View style={styles.dutyItemsList}>
                        {sec.items.map((it, iIdx) => (
                          <View key={iIdx} style={styles.bulletRow}>
                            <AppText variant="caption" color="primary" style={styles.bulletDot}>
                              •
                            </AppText>
                            <View style={styles.bulletContent}>
                              <AppText variant="bodySmall">
                                {isAr ? it.textAr || it.textEn : it.textEn || it.textAr}
                              </AppText>
                              {it.textEn && it.textAr && (
                                <AppText variant="caption" color="muted">
                                  {isAr ? it.textEn : it.textAr}
                                </AppText>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 3. Skills Matrix */}
          <View style={cardStyle}>
            <View style={styles.sectionHeader}>
              <AppIcon name="ribbon-outline" size={18} color={theme.colors.primary} />
              <AppText variant="label" style={styles.sectionTitle}>
                {t('organizationalStructure.jobDescriptionDetails.skills')}
              </AppText>
            </View>

            {skills.length === 0 ? (
              item.requiredSkills ? (
                <AppText variant="body">{item.requiredSkills}</AppText>
              ) : (
                <AppText variant="caption" color="muted">
                  {t('organizationalStructure.jobDescriptionDetails.emptySkills')}
                </AppText>
              )
            ) : (
              <View style={styles.skillsList}>
                {skills.map((skill, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.skillBadgeCard,
                      {
                        backgroundColor: theme.colors.surfaceMuted,
                        borderColor: skill.isMandatory ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.skillHeader}>
                      <AppText variant="bodySmall" style={styles.skillName}>
                        {skill.skillName}
                      </AppText>
                      {skill.isMandatory && (
                        <AppIcon name="star" size={14} color={theme.colors.warning} />
                      )}
                    </View>
                    <View style={styles.skillBadgesRow}>
                      <AppStatusBadge
                        color={theme.colors.secondary}
                        label={skill.proficiencyLevel}
                      />
                      <AppStatusBadge
                        color={skill.isMandatory ? theme.colors.danger : theme.colors.textMuted}
                        label={skill.isMandatory ? t('organizationalStructure.jobDescriptionDetails.mandatory') : t('organizationalStructure.jobDescriptionDetails.optional')}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 4. Qualifications & Experience */}
          <View style={cardStyle}>
            <View style={styles.sectionHeader}>
              <AppIcon name="school-outline" size={18} color={theme.colors.primary} />
              <AppText variant="label" style={styles.sectionTitle}>
                {t('organizationalStructure.jobDescriptionDetails.qualifications')}
              </AppText>
            </View>

            {item.minExperienceYears != null && item.minExperienceYears > 0 && (
              <View style={styles.experienceRow}>
                <AppText variant="bodySmall" color="muted">
                  {t('organizationalStructure.jobDescriptionDetails.minExperience')}:
                </AppText>
                <AppStatusBadge
                  color={theme.colors.primary}
                  label={`${item.minExperienceYears} ${t('organizationalStructure.jobDescriptionDetails.years')}`}
                />
              </View>
            )}

            {education.length > 0 ? (
              <View style={styles.educationList}>
                {education.map((req, idx) => (
                  <View
                    key={idx}
                    style={[styles.educationItem, { borderColor: theme.colors.border }]}
                  >
                    <View style={styles.educationContent}>
                      <AppText variant="bodySmall" style={styles.degreeTitle}>
                        {req.degreeLevel}
                      </AppText>
                      <AppText variant="caption" color="muted">
                        {req.fieldOfStudy}
                      </AppText>
                    </View>
                    <AppStatusBadge
                      color={req.isRequired ? theme.colors.primary : theme.colors.textMuted}
                      label={req.isRequired ? t('organizationalStructure.jobDescriptionDetails.mandatory') : t('organizationalStructure.jobDescriptionDetails.optional')}
                    />
                  </View>
                ))}
              </View>
            ) : (
              item.requiredEducation && (
                <AppText variant="body">{item.requiredEducation}</AppText>
              )
            )}

            {(item.preferredQualificationsAr || item.preferredQualificationsEn) && (
              <View style={styles.preferredBox}>
                <AppText variant="caption" color="muted" style={styles.preferredLabel}>
                  {t('organizationalStructure.jobDescriptionDetails.preferredQualifications')}:
                </AppText>
                {item.preferredQualificationsAr && (
                  <AppText variant="bodySmall">{item.preferredQualificationsAr}</AppText>
                )}
                {item.preferredQualificationsEn && (
                  <AppText variant="caption" color="muted">{item.preferredQualificationsEn}</AppText>
                )}
              </View>
            )}
          </View>

          {/* 5. Governance & Audit */}
          {(item.effectiveDate || item.expiryDate || item.decisionReason || item.revisionNotes) && (
            <View style={cardStyle}>
              <View style={styles.sectionHeader}>
                <AppIcon name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
                <AppText variant="label" style={styles.sectionTitle}>
                  {t('organizationalStructure.jobDescriptionDetails.governance')}
                </AppText>
              </View>

              {item.effectiveDate && (
                <View style={styles.auditRow}>
                  <AppText variant="caption" color="muted">
                    {t('organizationalStructure.jobDescriptionDetails.effectiveDate')}:
                  </AppText>
                  <AppText variant="bodySmall">{item.effectiveDate.slice(0, 10)}</AppText>
                </View>
              )}
              {item.expiryDate && (
                <View style={styles.auditRow}>
                  <AppText variant="caption" color="muted">
                    {t('organizationalStructure.jobDescriptionDetails.expiryDate')}:
                  </AppText>
                  <AppText variant="bodySmall">{item.expiryDate.slice(0, 10)}</AppText>
                </View>
              )}
              {item.decisionReason && (
                <View style={styles.auditBlock}>
                  <AppText variant="caption" color="muted">
                    {t('organizationalStructure.jobDescriptionDetails.decisionReason')}:
                  </AppText>
                  <AppText variant="bodySmall">{item.decisionReason}</AppText>
                </View>
              )}
              {item.revisionNotes && (
                <View style={styles.auditBlock}>
                  <AppText variant="caption" color="muted">
                    {t('organizationalStructure.jobDescriptionDetails.revisionNotes')}:
                  </AppText>
                  <AppText variant="caption" color="muted">{item.revisionNotes}</AppText>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Footer */}
        <View style={[styles.footerBar, { borderTopColor: theme.colors.border }]}>
          {canApprove && isDraft && onApprove && (
            <AppButton
              icon="checkmark-circle-outline"
              onPress={() => {
                onClose();
                onApprove(item);
              }}
              variant="primary"
            >
              {t('organizationalStructure.decision.approve')}
            </AppButton>
          )}

          {canApprove && isDraft && onReject && (
            <AppButton
              icon="close-circle-outline"
              onPress={() => {
                onClose();
                onReject(item);
              }}
              variant="danger"
            >
              {t('organizationalStructure.decision.reject')}
            </AppButton>
          )}

          {onViewLogs && (
            <AppButton
              icon="time-outline"
              onPress={() => {
                onClose();
                onViewLogs(item);
              }}
              variant="outline"
            >
              {t('actions.changeLog')}
            </AppButton>
          )}

          {canEdit && onEdit && (
            <AppButton
              icon="create-outline"
              onPress={() => {
                onClose();
                onEdit(item);
              }}
              variant="outline"
            >
              {t('organizationalStructure.edit')}
            </AppButton>
          )}

          <AppButton
            onPress={onClose}
            variant="ghost"
          >
            {t('common.close')}
          </AppButton>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: { flex: 1, gap: 2 },
  content: { padding: 16, gap: 14 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  mainTitle: { fontWeight: '700' },
  divider: { marginVertical: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontWeight: '700' },
  purposeText: { lineHeight: 22 },
  purposeTextEn: { fontStyle: 'italic', lineHeight: 20 },
  legacyTextContainer: { gap: 6 },
  sectionsList: { gap: 10 },
  sectionItem: { padding: 12, borderRadius: 8, borderWidth: 1, gap: 8 },
  sectionItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionItemTitle: { fontWeight: '700' },
  dutyItemsList: { gap: 6 },
  bulletRow: { flexDirection: 'row', gap: 6 },
  bulletDot: { fontSize: 16, lineHeight: 18 },
  bulletContent: { flex: 1, gap: 2 },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadgeCard: { padding: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, gap: 6 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  skillName: { fontWeight: '600' },
  skillBadgesRow: { flexDirection: 'row', gap: 4 },
  experienceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  educationList: { gap: 8 },
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  educationContent: { flex: 1, gap: 2 },
  degreeTitle: { fontWeight: '600' },
  preferredBox: { marginTop: 6, paddingTop: 6, gap: 4 },
  preferredLabel: { fontWeight: '700' },
  auditRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  auditBlock: { gap: 2, marginTop: 4 },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
});
