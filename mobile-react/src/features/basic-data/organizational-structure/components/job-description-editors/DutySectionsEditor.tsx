import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppDivider, AppIconButton, AppText, AppTextField } from '@/src/shared/components';
import type { JobDutyItem, JobDutySection } from '../../types/organizational-structure';

interface Props {
  sections: JobDutySection[];
  onChange: (sections: JobDutySection[]) => void;
  disabled?: boolean;
}

export function DutySectionsEditor({ sections = [], onChange, disabled = false }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const isAr = i18n.language === 'ar';

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
          {isAr ? 'مجالات العمل والواجبات المهيكلة' : 'Duty Sections & Items'}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAddSection}
            variant="outline"
          >
            {isAr ? 'إضافة قسم' : 'Add Section'}
          </AppButton>
        )}
      </View>

      {sections.length === 0 ? (
        <AppText color="muted" variant="caption">
          {isAr ? 'لم تتم إضافة أقسام مهام بعد.' : 'No duty sections added yet.'}
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
                  {isAr ? `قسم واجبات #${sIdx + 1}` : `Duty Section #${sIdx + 1}`}
                </AppText>
                {!disabled && (
                  <AppIconButton
                    icon="trash-outline"
                    label={isAr ? 'حذف القسم' : 'Delete Section'}
                    onPress={() => handleRemoveSection(sIdx)}
                  />
                )}
              </View>

              <AppTextField
                editable={!disabled}
                label={isAr ? 'عنوان المجال (عربي)' : 'Section Title (Ar)'}
                name={`secTitleAr_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { sectionTitleAr: val })}
                value={sec.sectionTitleAr}
              />
              <AppTextField
                editable={!disabled}
                label={isAr ? 'عنوان المجال (إنجليزي)' : 'Section Title (En)'}
                name={`secTitleEn_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { sectionTitleEn: val })}
                value={sec.sectionTitleEn}
              />
              <AppTextField
                editable={!disabled}
                keyboardType="numeric"
                label={isAr ? 'الوزن النسبي %' : 'Weight Percentage %'}
                name={`secWeight_${sIdx}`}
                onChangeText={(val) => handleUpdateSection(sIdx, { weightPercentage: val ? Number(val) : undefined })}
                value={sec.weightPercentage != null ? String(sec.weightPercentage) : ''}
              />

              <AppDivider style={styles.divider} />

              <AppText variant="caption" color="muted" style={styles.itemsHeader}>
                {isAr ? `بنود الواجبات والمسؤوليات (${sec.items.length}):` : `Duty Items (${sec.items.length}):`}
              </AppText>

              {sec.items.map((it, iIdx) => (
                <View key={iIdx} style={styles.itemRow}>
                  <View style={styles.itemInputs}>
                    <AppTextField
                      editable={!disabled}
                      label={isAr ? `بند #${iIdx + 1} (عربي)` : `Item #${iIdx + 1} (Ar)`}
                      name={`itemAr_${sIdx}_${iIdx}`}
                      onChangeText={(val) => handleUpdateItem(sIdx, iIdx, { textAr: val })}
                      value={it.textAr}
                    />
                    <AppTextField
                      editable={!disabled}
                      label={isAr ? `بند #${iIdx + 1} (إنجليزي)` : `Item #${iIdx + 1} (En)`}
                      name={`itemEn_${sIdx}_${iIdx}`}
                      onChangeText={(val) => handleUpdateItem(sIdx, iIdx, { textEn: val })}
                      value={it.textEn}
                    />
                  </View>
                  {!disabled && (
                    <AppIconButton
                      icon="close-circle-outline"
                      label={isAr ? 'حذف البند' : 'Remove Item'}
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
                  {isAr ? 'إضافة بند مسؤولية' : 'Add Duty Item'}
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
