import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppDivider, AppIconButton, AppText, AppTextField } from '@/src/shared/components';
import type { JobDutyItem, JobDutySection } from '../../../domain/models/organizational-structure';

interface Props {
  sections: JobDutySection[];
  onChange: (sections: JobDutySection[]) => void;
  disabled?: boolean;
}

export function DutySectionsEditor({ sections = [], onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const handleAddSection = () => {
    onChange([
      ...sections,
      {
        sectionTitleAr: '',
        sectionTitleEn: '',
        weightPercentage: undefined,
        items: [{ textAr: '', textEn: '', order: 1 }],
      },
    ]);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    onChange(sections.filter((_, i) => i !== sectionIndex));
  };

  const handleUpdateSection = (sectionIndex: number, updated: Partial<JobDutySection>) => {
    onChange(sections.map((sec, i) => (i === sectionIndex ? { ...sec, ...updated } : sec)));
  };

  const handleAddItem = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    const newItems: JobDutyItem[] = [
      ...sec.items,
      { textAr: '', textEn: '', order: sec.items.length + 1 },
    ];
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    const sec = sections[sectionIndex];
    const newItems = sec.items.filter((_, i) => i !== itemIndex);
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  const handleUpdateItem = (sectionIndex: number, itemIndex: number, updated: Partial<JobDutyItem>) => {
    const sec = sections[sectionIndex];
    const newItems = sec.items.map((it, i) => (i === itemIndex ? { ...it, ...updated } : it));
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" style={styles.title}>
          {t('organizationalStructure.jobDescriptionEditors.duties.title')}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAddSection}
            variant="outline"
          >
            {t('organizationalStructure.jobDescriptionEditors.duties.addSection')}
          </AppButton>
        )}
      </View>

      {sections.length === 0 ? (
        <AppText color="muted" variant="caption">
          {t('organizationalStructure.jobDescriptionEditors.duties.empty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {sections.map((sec, sIdx) => (
            <View
              key={sIdx}
              style={[styles.sectionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
            >
              <View style={styles.cardHeader}>
                <AppText variant="label" style={styles.cardTitle}>
                  {t('organizationalStructure.jobDescriptionEditors.duties.sectionNumber', { number: sIdx + 1 })}
                </AppText>
                {!disabled && (
                  <AppIconButton
                    icon="trash-outline"
                    label={t('organizationalStructure.jobDescriptionEditors.duties.removeSection')}
                    onPress={() => handleRemoveSection(sIdx)}
                  />
                )}
              </View>

              <AppTextField
                editable={!disabled}
                label={t('organizationalStructure.jobDescriptionEditors.duties.titleArabic')}
                name={`secTitleAr_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { sectionTitleAr: val })}
                value={sec.sectionTitleAr}
              />
              <AppTextField
                editable={!disabled}
                label={t('organizationalStructure.jobDescriptionEditors.duties.titleEnglish')}
                name={`secTitleEn_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { sectionTitleEn: val })}
                value={sec.sectionTitleEn}
              />
              <AppTextField
                editable={!disabled}
                keyboardType="numeric"
                label={t('organizationalStructure.jobDescriptionEditors.duties.weightPercentage')}
                name={`secWeight_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { weightPercentage: val ? Number(val) : undefined })}
                value={sec.weightPercentage != null ? String(sec.weightPercentage) : ''}
              />

              <AppDivider style={styles.divider} />

              <AppText variant="caption" color="muted" style={styles.itemsHeader}>
                {t('organizationalStructure.jobDescriptionEditors.duties.itemsCount', { count: sec.items.length })}
              </AppText>

              {sec.items.map((it, iIdx) => (
                <View key={iIdx} style={styles.itemRow}>
                  <View style={styles.itemInputs}>
                    <AppTextField
                      editable={!disabled}
                      label={t('organizationalStructure.jobDescriptionEditors.duties.itemArabic', { number: iIdx + 1 })}
                      name={`itemAr_${sIdx}_${iIdx}`}
                      onChangeText={(val) => handleUpdateItem(sIdx, iIdx, { textAr: val })}
                      value={it.textAr}
                    />
                    <AppTextField
                      editable={!disabled}
                      label={t('organizationalStructure.jobDescriptionEditors.duties.itemEnglish', { number: iIdx + 1 })}
                      name={`itemEn_${sIdx}_${iIdx}`}
                      onChangeText={(val) => handleUpdateItem(sIdx, iIdx, { textEn: val })}
                      value={it.textEn}
                    />
                  </View>
                  {!disabled && (
                    <AppIconButton
                      icon="close-circle-outline"
                      label={t('organizationalStructure.jobDescriptionEditors.duties.removeItem')}
                      onPress={() => handleRemoveItem(sIdx, iIdx)}
                    />
                  )}
                </View>
              ))}

              {!disabled && (
                <AppButton
                  icon="add-circle-outline"
                  onPress={() => handleAddItem(sIdx)}
                  variant="ghost"
                >
                  {t('organizationalStructure.jobDescriptionEditors.duties.addItem')}
                </AppButton>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '600' },
  list: { gap: 12 },
  sectionCard: { padding: 12, borderRadius: 8, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '600' },
  divider: { marginVertical: 6 },
  itemsHeader: { fontWeight: '600' },
  itemRow: { gap: 4, marginVertical: 4 },
  itemInputs: { gap: 6 },
});
