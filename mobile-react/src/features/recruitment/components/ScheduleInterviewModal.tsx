import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppText, showToast } from '@/src/shared/components';
import { useScheduleInterview } from '../queries/use-recruitment';
import { InterviewType } from '../types';

interface ScheduleInterviewModalProps {
  visible: boolean;
  applicationId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
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

  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.Technical);
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new');

  const types = [
    { id: InterviewType.Technical, label: t('recruitment.interviewTypes.technical', 'تقنية / Technical') },
    { id: InterviewType.Video, label: t('recruitment.interviewTypes.videoCall', 'فيديو / Video Call') },
    { id: InterviewType.Phone, label: t('recruitment.interviewTypes.phone', 'هاتف / Phone') },
    { id: InterviewType.HumanResources, label: t('recruitment.interviewTypes.behavioral', 'سلوكية / HR') },
    { id: InterviewType.OnSite, label: t('recruitment.interviewTypes.onSite', 'حضوري / On-Site') },
    { id: InterviewType.Panel, label: t('recruitment.interviewTypes.panel', 'لجنة / Panel') },
  ];

  const handleSchedule = async () => {
    if (!applicationId) return;

    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const tomorrowPlusHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      await scheduleMutation.mutateAsync({
        employmentApplicationId: applicationId,
        type: interviewType,
        startsOn: tomorrow.toISOString(),
        endsOn: tomorrowPlusHour.toISOString(),
        locationOrMeetingUrl: meetingUrl,
        leadEmployeeId: 1,
      });

      showToast.success(t('recruitment.interviews.scheduledSuccess', 'تمت جدولة المقابلة بنجاح'));
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء الجدولة'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <AppIcon name="calendar-outline" size={22} color={theme.colors.primary} />
              <AppText variant="titleSmall" weight="800">
                {t('recruitment.interviews.scheduleTitle', 'جدولة مقابلة شخصية / Schedule Interview')}
              </AppText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <AppText variant="label" weight="700" style={{ color: theme.colors.text }}>
              {t('recruitment.interviews.type', 'نوع المقابلة / Interview Type')}
            </AppText>
            <View style={styles.typesRow}>
              {types.map((tp) => {
                const isSelected = interviewType === tp.id;
                return (
                  <Pressable
                    key={tp.id}
                    onPress={() => setInterviewType(tp.id)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceMuted,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? '800' : '600'}
                      style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.text }}
                    >
                      {tp.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="label" weight="700" style={{ color: theme.colors.text, marginTop: 8 }}>
              {t('recruitment.interviews.locationOrUrl', 'المكان أو رابط الاجتماع / Meeting URL')}
            </AppText>
            <TextInput
              value={meetingUrl}
              onChangeText={setMeetingUrl}
              placeholder="https://meet.google.com/..."
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
            />
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <AppButton variant="outline" onPress={onClose}>
              {t('common.cancel', 'إلغاء / Cancel')}
            </AppButton>
            <AppButton
              variant="primary"
              loading={scheduleMutation.isPending}
              onPress={handleSchedule}
              icon="calendar-outline"
            >
              {t('recruitment.actions.scheduleInterview', 'جدولة / Schedule')}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    gap: 8,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
});
