import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIconButton, AppSwitchField, AppText, AppTextField } from '@/src/shared/components';
import type { JobEducationRequirement } from '../../../domain/models/organizational-structure';

interface Props {
  requirements: JobEducationRequirement[];
  onChange: (requirements: JobEducationRequirement[]) => void;
  disabled?: boolean;
}

export function EducationRequirementsEditor({ requirements = [], onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const handleAdd = () => {
    onChange([...requirements, { degreeLevel: '', fieldOfStudy: '', isRequired: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(requirements.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Partial<JobEducationRequirement>) => {
    onChange(requirements.map((item, i) => (i === index ? { ...item, ...updated } : item)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" style={styles.title}>
          {t('organizationalStructure.jobDescriptionEditors.education.title')}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAdd}
            variant="outline"
          >
            {t('organizationalStructure.jobDescriptionEditors.education.add')}
          </AppButton>
        )}
      </View>

      {requirements.length === 0 ? (
        <AppText color="muted" variant="caption">
          {t('organizationalStructure.jobDescriptionEditors.education.empty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {requirements.map((req, index) => (
            <View
              key={index}
              style={[styles.itemCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
            >
              <View style={styles.cardHeader}>
                <AppText variant="label" style={styles.cardTitle}>
                  {t('organizationalStructure.jobDescriptionEditors.education.number', { number: index + 1 })}
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
                label={t('organizationalStructure.jobDescriptionEditors.education.degreeLevel')}
                name={`degreeLevel_${index}`}
                onChangeText={(val) => handleUpdate(index, { degreeLevel: val })}
                value={req.degreeLevel}
              />
              <AppTextField
                editable={!disabled}
                label={t('organizationalStructure.jobDescriptionEditors.education.fieldOfStudy')}
                name={`fieldOfStudy_${index}`}
                onChangeText={(val) => handleUpdate(index, { fieldOfStudy: val })}
                value={req.fieldOfStudy}
              />
              <AppSwitchField
                disabled={disabled}
                label={t('organizationalStructure.jobDescriptionEditors.education.mandatory')}
                name={`isRequired_${index}`}
                onValueChange={(val) => handleUpdate(index, { isRequired: val })}
                value={req.isRequired}
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
