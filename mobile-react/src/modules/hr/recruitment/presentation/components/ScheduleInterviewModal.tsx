import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import {
  AppDateTimeField,
  AppForm,
  AppFormSection,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import { useScheduleInterview } from '../queries/use-recruitment';
import { InterviewType } from '../../domain/models/recruitment';

interface ScheduleInterviewModalProps {
  visible: boolean;
  applicationId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type InterviewErrors = Partial<Record<string, string>>;

function defaultInterviewTimes(): { startsOn: string; endsOn: string } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { startsOn: start.toISOString(), endsOn: end.toISOString() };
}

export function ScheduleInterviewModal({
  visible,
  applicationId,
  onClose,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const scheduleMutation = useScheduleInterview();
  const [initialTimes, setInitialTimes] = useState(defaultInterviewTimes);
  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.Technical);
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new');
  const [startsOn, setStartsOn] = useState(initialTimes.startsOn);
  const [endsOn, setEndsOn] = useState(initialTimes.endsOn);
  const [errors, setErrors] = useState<InterviewErrors>({});
  const [focusErrorRequestId, setFocusErrorRequestId] = useState(0);

  const types = [
    { id: InterviewType.Technical, label: t('recruitment.interviewTypes.technical') },
    { id: InterviewType.Video, label: t('recruitment.interviewTypes.videoCall') },
    { id: InterviewType.Phone, label: t('recruitment.interviewTypes.phone') },
    { id: InterviewType.HumanResources, label: t('recruitment.interviewTypes.behavioral') },
    { id: InterviewType.OnSite, label: t('recruitment.interviewTypes.onSite') },
    { id: InterviewType.Panel, label: t('recruitment.interviewTypes.panel') },
  ];

  const reset = () => {
    const defaults = defaultInterviewTimes();
    setInterviewType(InterviewType.Technical);
    setMeetingUrl('https://meet.google.com/new');
    setInitialTimes(defaults);
    setStartsOn(defaults.startsOn);
    setEndsOn(defaults.endsOn);
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSchedule = async () => {
    if (!applicationId) return;

    const start = new Date(startsOn);
    const end = new Date(endsOn);
    const nextErrors: InterviewErrors = {};
    if (!startsOn || Number.isNaN(start.getTime())) {
      nextErrors.startsOn = t('recruitment.interviews.startValidation');
    }
    if (!endsOn || Number.isNaN(end.getTime()) || end <= start) {
      nextErrors.endsOn = t('recruitment.interviews.endValidation');
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFocusErrorRequestId((current) => current + 1);
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        employmentApplicationId: applicationId,
        type: interviewType,
        startsOn: start.toISOString(),
        endsOn: end.toISOString(),
        locationOrMeetingUrl: meetingUrl.trim() || undefined,
      });
      showToast.success(t('recruitment.interviews.scheduledSuccess'));
      onSuccess?.();
      handleClose();
    } catch (error) {
      showToast.error(error, t('common.error'));
    }
  };

  return (
    <AppForm
      visible={visible}
      presentation="dialog"
      title={t('recruitment.interviews.scheduleTitle')}
      subtitle={t('recruitment.interviews.scheduleSubtitle')}
      icon="calendar-outline"
      errors={errors}
      focusErrorRequestId={focusErrorRequestId}
      onClearFieldError={(name) => setErrors((current) => ({ ...current, [name]: undefined }))}
      onCancel={handleClose}
      onSubmit={handleSchedule}
      submitLabel={t('recruitment.actions.scheduleInterview')}
      submitting={scheduleMutation.isPending}
      isDirty={
        interviewType !== InterviewType.Technical ||
        meetingUrl !== 'https://meet.google.com/new' ||
        startsOn !== initialTimes.startsOn ||
        endsOn !== initialTimes.endsOn
      }
      contentContainerStyle={styles.content}
    >
      <AppFormSection title={t('recruitment.interviews.detailsSection')} icon="people-outline">
        <View style={styles.typesRow}>
          {types.map((option) => {
            const selected = interviewType === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setInterviewType(option.id)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  weight={selected ? '800' : '600'}
                  style={{ color: selected ? theme.colors.onPrimary : theme.colors.text }}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppDateTimeField
          name="startsOn"
          label={t('recruitment.interviews.startsOn')}
          value={startsOn}
          onChangeValue={setStartsOn}
          mode="datetime"
          minimumDate={new Date()}
          required
        />
        <AppDateTimeField
          name="endsOn"
          label={t('recruitment.interviews.endsOn')}
          value={endsOn}
          onChangeValue={setEndsOn}
          mode="datetime"
          minimumDate={startsOn ? new Date(startsOn) : new Date()}
          required
        />
        <AppTextField
          name="meetingUrl"
          label={t('recruitment.interviews.locationOrUrl')}
          value={meetingUrl}
          onChangeText={setMeetingUrl}
          leadingIcon="videocam-outline"
        />
      </AppFormSection>
    </AppForm>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});
