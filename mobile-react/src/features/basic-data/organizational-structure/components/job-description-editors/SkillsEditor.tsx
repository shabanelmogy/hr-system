import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIconButton, AppSegmentedControl, AppSwitchField, AppText, AppTextField } from '@/src/shared/components';
import type { JobSkillItem } from '../../types/organizational-structure';

interface Props {
  skills: JobSkillItem[];
  onChange: (skills: JobSkillItem[]) => void;
  disabled?: boolean;
}

export function SkillsEditor({ skills = [], onChange, disabled = false }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const isAr = i18n.language === 'ar';

  const handleAdd = () => {
    onChange([...skills, { skillName: '', proficiencyLevel: 'Intermediate', isMandatory: false }]);
  };

  const handleRemove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Partial<JobSkillItem>) => {
    onChange(skills.map((item, i) => (i === index ? { ...item, ...updated } : item)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" style={styles.title}>
          {isAr ? 'المهارات المطلوبة ومستويات الإتقان' : 'Required Skills & Proficiency Levels'}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAdd}
            variant="outline"
          >
            {isAr ? 'إضافة مهارة' : 'Add Skill'}
          </AppButton>
        )}
      </View>

      {skills.length === 0 ? (
        <AppText color="muted" variant="caption">
          {isAr ? 'لم تتم إضافة مهارات بعد.' : 'No skills added yet.'}
        </AppText>
      ) : (
        <View style={styles.list}>
          {skills.map((skill, index) => (
            <View
              key={index}
              style={[styles.itemCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
            >
              <View style={styles.cardHeader}>
                <AppText variant="label" style={styles.cardTitle}>
                  {isAr ? `مهارة #${index + 1}` : `Skill #${index + 1}`}
                </AppText>
                {!disabled && (
                  <AppIconButton
                    icon="trash-outline"
                    label={isAr ? 'حذف' : 'Delete'}
                    onPress={() => handleRemove(index)}
                  />
                )}
              </View>
              <AppTextField
                editable={!disabled}
                label={isAr ? 'اسم المهارة' : 'Skill Name'}
                name={`skillName_${index}`}
                onChangeText={(val) => handleUpdate(index, { skillName: val })}
                value={skill.skillName}
              />
              <AppSegmentedControl
                disabled={disabled}
                label={isAr ? 'مستوى الإتقان' : 'Proficiency Level'}
                onChange={(val) => handleUpdate(index, { proficiencyLevel: String(val) })}
                options={[
                  { label: isAr ? 'مبتدئ' : 'Beg', value: 'Beginner' },
                  { label: isAr ? 'متوسط' : 'Int', value: 'Intermediate' },
                  { label: isAr ? 'متقدم' : 'Adv', value: 'Advanced' },
                  { label: isAr ? 'خبير' : 'Exp', value: 'Expert' },
                ]}
                value={skill.proficiencyLevel || 'Intermediate'}
              />
              <AppSwitchField
                disabled={disabled}
                label={isAr ? 'مهارة إلزامية للوظيفة' : 'Mandatory for this job'}
                name={`isMandatory_${index}`}
                onValueChange={(val) => handleUpdate(index, { isMandatory: val })}
                value={skill.isMandatory}
              />
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
  list: { gap: 10 },
  itemCard: { padding: 12, borderRadius: 8, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '600' },
});
