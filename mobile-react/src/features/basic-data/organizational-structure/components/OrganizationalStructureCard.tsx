import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppDataCard, AppIcon, AppIconButton, AppStatusBadge, AppText } from '@/src/shared/components';
import type { OrganizationalStructureItem } from '../types/organizational-structure';
import { canDecideJobDescription, getJobDescriptionStatusKey } from '../utils/job-description-status';

interface Props { item: OrganizationalStructureItem; canEdit: boolean; canDelete: boolean; canApprove: boolean; active?: boolean; onEdit: (item: OrganizationalStructureItem) => void; onArchive: (item: OrganizationalStructureItem) => void; onRestore: (item: OrganizationalStructureItem) => void; onView: (item: OrganizationalStructureItem) => void; onApprove: (item: OrganizationalStructureItem) => void; onReject: (item: OrganizationalStructureItem) => void; onViewLogs?: (item: OrganizationalStructureItem) => void; }
export function OrganizationalStructureCard({ item, canEdit, canDelete, canApprove, active, onEdit, onArchive, onRestore, onView, onApprove, onReject, onViewLogs }: Props) {
  const { t } = useTranslation(); const { theme } = useAppTheme();
  const lastPressRef = useRef<number>(0);

  const handleCardPress = () => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) {
      lastPressRef.current = 0;
      onView(item);
    } else {
      lastPressRef.current = now;
    }
  };

  const parent = (item.resource === 'departments' && (item.isCentralized || !item.branchId))
    ? t('organizationalStructure.fields.centralized')
    : (item.positionCode ?? item.divisionNameEn ?? item.departmentNameEn ?? item.branchNameEn ?? t('organizationalStructure.currentCompany'));
  const descriptionStatus = getJobDescriptionStatusKey(item);
  return <AppDataCard active={active} onPress={handleCardPress} padding="sm" style={styles.card}>
    <View style={styles.header}><View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}><AppIcon color={theme.colors.primary} name="business-outline" size={21} /></View><View style={styles.name}><AppText numberOfLines={1} variant="label">{item.nameEn}</AppText><AppText color="muted" numberOfLines={1} variant="bodySmall">{item.nameAr}</AppText></View><AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'organizationalStructure.status.archived' : 'organizationalStructure.status.active')} /></View>
    <View style={styles.details}><AppText color="muted" variant="caption">{item.code}</AppText><AppText color="muted" numberOfLines={1} variant="caption">{t('organizationalStructure.fields.parent')}: {parent}</AppText>{item.targetHeadcount != null ? <AppText color="muted" variant="caption">{t('organizationalStructure.fields.targetHeadcount')}: {item.targetHeadcount}</AppText> : null}{descriptionStatus ? <AppText color="muted" variant="caption">{t(`organizationalStructure.jobDescriptionStatus.${descriptionStatus}`)}</AppText> : null}</View>
    <View style={styles.actions}>{item.resource === 'job-descriptions' ? <AppButton icon="eye-outline" onPress={() => onView(item)} size="sm" style={styles.viewProfileButton} variant="primary">{t('organizationalStructure.jobDescriptionDetails.profileTitle')}</AppButton> : <AppIconButton icon="eye-outline" label={t('organizationalStructure.view')} onPress={() => onView(item)} />}{onViewLogs ? <AppIconButton icon="time-outline" label={t('actions.changeLog')} onPress={() => onViewLogs(item)} /> : null}{canEdit && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('organizationalStructure.edit')} onPress={() => onEdit(item)} /> : null}{canDelete ? <AppIconButton icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(item.isDeleted ? 'organizationalStructure.restore' : 'organizationalStructure.archive')} onPress={() => item.isDeleted ? onRestore(item) : onArchive(item)} /> : null}{canApprove && canDecideJobDescription(item) ? <><AppIconButton icon="checkmark-circle-outline" label={t('organizationalStructure.decision.approve')} onPress={() => onApprove(item)} /><AppIconButton icon="close-circle-outline" label={t('organizationalStructure.decision.reject')} onPress={() => onReject(item)} /></> : null}</View>
  </AppDataCard>;
}
const styles = StyleSheet.create({ card: { gap: 7 }, header: { flexDirection: 'row', alignItems: 'center', gap: 7 }, icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }, name: { flex: 1, minWidth: 0 }, details: { gap: 3 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }, viewProfileButton: { paddingVertical: 4, paddingHorizontal: 8 } });
