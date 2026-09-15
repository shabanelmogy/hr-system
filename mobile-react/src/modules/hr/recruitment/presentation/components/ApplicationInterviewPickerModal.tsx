import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppModal,
  AppPaginationNavigation,
  AppStateView,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';
import {
  InterviewStatus,
  InterviewType,
  type InterviewDto,
} from '../../domain/models/recruitment';
import { useInterviews } from '../queries/use-recruitment';

interface ApplicationInterviewPickerModalProps {
  visible: boolean;
  applicationId: number | null;
  canEvaluateInterviews: boolean;
  canManageApplications: boolean;
  onClose: () => void;
  onSelect: (interview: InterviewDto) => void;
}

const PAGE_SIZE = 10;

const interviewTypeTranslationKeys: Record<InterviewType, string> = {
  [InterviewType.Phone]: 'phone',
  [InterviewType.Video]: 'videoCall',
  [InterviewType.OnSite]: 'onSite',
  [InterviewType.HumanResources]: 'behavioral',
  [InterviewType.Technical]: 'technical',
  [InterviewType.Panel]: 'panel',
};

function getInterviewTypeTranslationKey(type: InterviewType): string {
  return interviewTypeTranslationKeys[type];
}

export function ApplicationInterviewPickerModal({
  visible,
  applicationId,
  canEvaluateInterviews,
  canManageApplications,
  onClose,
  onSelect,
}: ApplicationInterviewPickerModalProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const [pageState, setPageState] = useState<{ applicationId: number | null; page: number }>({
    applicationId: null,
    page: 0,
  });
  const page = pageState.applicationId === applicationId ? pageState.page : 0;
  const interviewsQuery = useInterviews(
    {
      pageNumber: page + 1,
      pageSize: PAGE_SIZE,
      applicationId: applicationId ?? undefined,
    },
    visible && applicationId !== null && applicationId > 0,
  );
  const interviewPage = interviewsQuery.data;
  const interviews = (interviewPage?.items ?? []).filter(
    (interview) =>
      canEvaluateInterviews && (
        interview.status === InterviewStatus.Completed ||
        (canManageApplications && interview.status === InterviewStatus.Scheduled)
      ),
  );

  return (
    <AppModal
      closeLabel={t('common.close')}
      icon="calendar-outline"
      onClose={onClose}
      title={t('recruitment.interviews.selectTitle')}
      subtitle={t('recruitment.interviews.selectSubtitle')}
      visible={visible}
    >
      {interviewsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : interviewsQuery.isError ? (
        <AppStateView
          message={t('feedback.unknownError')}
          onRetry={() => { void interviewsQuery.refetch(); }}
          state="error"
        />
      ) : (
        <View style={styles.list}>
          {interviews.length === 0 ? (
            <AppStateView
              message={t(
                (interviewPage?.metaData.totalCount ?? 0) === 0
                  ? 'recruitment.interviews.noInterviews'
                  : 'recruitment.interviews.noEvaluableInterviews',
              )}
              state="empty"
            />
          ) : interviews.map((interview) => {
            const statusKey = InterviewStatus[interview.status];
            return (
              <AppCard
                key={interview.id}
                accessibilityLabel={t('recruitment.interviews.selectInterviewFor', {
                  candidate: interview.candidateName,
                  type: t(`recruitment.interviewTypes.${getInterviewTypeTranslationKey(interview.type)}`),
                })}
                onPress={() => onSelect(interview)}
                padding="md"
                testID={`recruitment-interview-${interview.id}`}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleGroup}>
                    <AppText variant="bodySmall" weight="800">
                      {interview.candidateName}
                    </AppText>
                    <AppText color="muted" variant="caption">
                      {interview.openingNumber} · {i18n.language.startsWith('ar') ? interview.positionTitleAr : interview.positionTitleEn}
                    </AppText>
                  </View>
                  <AppStatusBadge
                    color={interview.status === InterviewStatus.Completed ? theme.colors.success : theme.colors.primary}
                    label={t(`recruitment.interviews.statusValues.${statusKey}`)}
                  />
                </View>
                <AppText variant="bodySmall">
                  {t(`recruitment.interviewTypes.${getInterviewTypeTranslationKey(interview.type)}`)}
                </AppText>
                <AppText color="muted" variant="caption">
                  {new Date(interview.startsOn).toLocaleString(i18n.language)} – {new Date(interview.endsOn).toLocaleTimeString(i18n.language)}
                </AppText>
                <AppText color="primary" variant="bodySmall" weight="700">
                  {t('recruitment.interviews.selectAction')}
                </AppText>
              </AppCard>
            );
          })}
          {interviewPage && interviewPage.metaData.totalPages > 1 ? (
            <AppPaginationNavigation
              onPageChange={(nextPage) => setPageState({ applicationId, page: nextPage })}
              page={page}
              pageCount={interviewPage.metaData.totalPages}
            />
          ) : null}
        </View>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
});
