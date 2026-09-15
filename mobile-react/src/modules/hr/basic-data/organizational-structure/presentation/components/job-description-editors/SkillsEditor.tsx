import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIconButton, AppSegmentedControl, AppSwitchField, AppText, AppTextField } from '@/src/shared/components';
import type { JobSkillItem } from '../../../domain/models/organizational-structure';

interface Props {
  skills: JobSkillItem[];
  onChange: (skills: JobSkillItem[]) => void;
  disabled?: boolean;
}

export function SkillsEditor({ skills = [], onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

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
          {t('organizationalStructure.jobDescriptionEditors.skills.title')}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAdd}
            variant="outline"
          >
            {t('organizationalStructure.jobDescriptionEditors.skills.add')}
          </AppButton>
        )}
      </View>

      {skills.length === 0 ? (
        <AppText color="muted" variant="caption">
          {t('organizationalStructure.jobDescriptionEditors.skills.empty')}
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
                  {t('organizationalStructure.jobDescriptionEditors.skills.number', { number: index + 1 })}
                </AppText>
                {!disabled && (
                  <AppIconButton
                    icon="trash-outline"
                    label={t('common.delete')}
                    onPress={() => handleRemove(index)}
                  />
                )}
              </View>
              <AppTextField
                editable={!disabled}
                label={t('organizationalStructure.jobDescriptionEditors.skills.name')}
                name={`skillName_${index}`}
                onChangeText={(val) => handleUpdate(index, { skillName: val })}
                value={skill.skillName}
              />
              <AppSegmentedControl
                disabled={disabled}
                label={t('organizationalStructure.jobDescriptionEditors.skills.proficiency')}
                onChange={(val) => handleUpdate(index, { proficiencyLevel: String(val) })}
                options={[
                  { label: t('organizationalStructure.jobDescriptionEditors.skills.level.beginner'), value: 'Beginner' },
                  { label: t('organizationalStructure.jobDescriptionEditors.skills.level.intermediate'), value: 'Intermediate' },
                  { label: t('organizationalStructure.jobDescriptionEditors.skills.level.advanced'), value: 'Advanced' },
                  { label: t('organizationalStructure.jobDescriptionEditors.skills.level.expert'), value: 'Expert' },
                ]}
                value={skill.proficiencyLevel || 'Intermediate'}
              />
              <AppSwitchField
                disabled={disabled}
                label={t('organizationalStructure.jobDescriptionEditors.skills.mandatory')}
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
