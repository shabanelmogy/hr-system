import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIconButton, AppSwitchField, AppText, AppTextField } from '@/src/shared/components';
import type { JobEducationRequirement } from '../../types/organizational-structure';

interface Props {
  requirements: JobEducationRequirement[];
  onChange: (requirements: JobEducationRequirement[]) => void;
  disabled?: boolean;
}

export function EducationRequirementsEditor({ requirements = [], onChange, disabled = false }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const isAr = i18n.language === 'ar';

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
          {isAr ? 'المؤهلات العلمية المطلوبة' : 'Education Requirements'}
        </AppText>
        {!disabled && (
          <AppButton
            icon="add-outline"
            onPress={handleAdd}
            variant="outline"
          >
            {isAr ? 'إضافة مؤهل' : 'Add Education'}
          </AppButton>
        )}
      </View>

      {requirements.length === 0 ? (
        <AppText color="muted" variant="caption">
          {isAr ? 'لم تتم إضافة مؤهلات علمية بعد.' : 'No education requirements added yet.'}
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
                  {isAr ? `مؤهل #${index + 1}` : `Requirement #${index + 1}`}
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
                label={isAr ? 'المستوى الدراسي (بكالوريوس / ماجستير)' : 'Degree Level (Bachelor / Master)'}
                name={`degreeLevel_${index}`}
                onChangeText={(val) => handleUpdate(index, { degreeLevel: val })}
                value={req.degreeLevel}
              />
              <AppTextField
                editable={!disabled}
                label={isAr ? 'التخصص / مجال الدراسة' : 'Field of Study'}
                name={`fieldOfStudy_${index}`}
                onChangeText={(val) => handleUpdate(index, { fieldOfStudy: val })}
                value={req.fieldOfStudy}
              />
              <AppSwitchField
                disabled={disabled}
                label={isAr ? 'مؤهل إلزامي' : 'Mandatory requirement'}
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
