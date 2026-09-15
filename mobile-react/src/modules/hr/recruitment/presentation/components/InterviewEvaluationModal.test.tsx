/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  InterviewStatus,
  InterviewType,
  type InterviewDto,
  type InterviewScorecardTemplateDto,
} from '../../domain/models/recruitment';
import { InterviewEvaluationModal } from './InterviewEvaluationModal';

const mockCompleteInterview = jest.fn();
const mockEvaluateInterview = jest.fn();
const mockUseScorecardTemplate = jest.fn();
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}));
jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: {
    border: '#ccc', danger: '#f00', primary: '#00f', surface: '#fff', text: '#111',
    textMuted: '#666', warning: '#fa0',
  } } }),
}));
jest.mock('../queries/use-recruitment', () => ({
  useCompleteInterview: () => ({ isPending: false, mutateAsync: (...args: unknown[]) => mockCompleteInterview(...args) }),
  useEvaluateInterview: () => ({ isPending: false, mutateAsync: (...args: unknown[]) => mockEvaluateInterview(...args) }),
  useScorecardTemplate: (...args: unknown[]) => mockUseScorecardTemplate(...args),
}));
jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppButton: ({ children, disabled, onPress, loading }: {
      children: React.ReactNode;
      disabled?: boolean;
      loading?: boolean;
      onPress: () => void;
    }) => (
      <Pressable
        disabled={disabled || loading}
        onPress={onPress}
        testID={children === 'recruitment.evaluation.submit' ? 'submit-evaluation' : 'cancel-evaluation'}
      >
        <Text>{children}</Text>
      </Pressable>
    ),
    AppIcon: () => null,
    AppModal: ({ children, footer, title, visible }: {
      children: React.ReactNode;
      footer: React.ReactNode;
      title: string;
      visible: boolean;
    }) => visible ? <View testID="evaluation-modal"><Text>{title}</Text>{children}{footer}</View> : null,
    AppStateView: ({ message, onRetry, state }: { message?: string; onRetry?: () => void; state: string }) => (
      <View testID={`scorecard-${state}`}>
        {message ? <Text>{message}</Text> : null}
        {onRetry ? <Pressable onPress={onRetry} testID="retry-scorecard" /> : null}
      </View>
    ),
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    showToast: {
      error: (...args: unknown[]) => mockToastError(...args),
      success: (...args: unknown[]) => mockToastSuccess(...args),
    },
  };
});

function createInterview(status: InterviewStatus): InterviewDto {
  return {
    id: 81,
    employmentApplicationId: 3,
    candidateName: 'Sam Applicant',
    openingNumber: 'OPEN-5',
    positionTitleEn: 'Accountant',
    positionTitleAr: 'محاسب',
    type: InterviewType.Technical,
    status,
    startsOn: '2026-09-15T09:00:00Z',
    endsOn: '2026-09-15T10:00:00Z',
    completedOn: status === InterviewStatus.Completed ? '2026-09-15T10:00:00Z' : null,
    locationOrMeetingUrl: null,
    cancellationReason: null,
    participants: [],
    evaluations: [],
  };
}

function createScorecard(skills: InterviewScorecardTemplateDto['skills'] = [{
  skillName: 'Communication',
  proficiencyLevel: 'Advanced',
  isMandatory: true,
  defaultWeightPercentage: 100,
}]): InterviewScorecardTemplateDto {
  return {
    interviewId: 81,
    employmentApplicationId: 3,
    candidateName: 'Sam Applicant',
    positionTitleEn: 'Accountant',
    positionTitleAr: 'محاسب',
    jobDescriptionId: null,
    skills,
  };
}

describe('InterviewEvaluationModal', () => {
  const refetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScorecardTemplate.mockReturnValue({
      data: createScorecard(),
      isError: false,
      isLoading: false,
      refetch,
    });
    mockCompleteInterview.mockResolvedValue(createInterview(InterviewStatus.Completed));
    mockEvaluateInterview.mockResolvedValue(createInterview(InterviewStatus.Completed));
  });

  it('uses the selected InterviewDto id for scorecard and evaluation without completing an already completed interview', async () => {
    await render(
      <InterviewEvaluationModal
        canManageApplications={false}
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Completed)}
        onClose={jest.fn()}
        visible
      />,
    );

    expect(mockUseScorecardTemplate).toHaveBeenCalledWith(81);
    await fireEvent.press(screen.getByTestId('submit-evaluation'));

    await waitFor(() => expect(mockEvaluateInterview).toHaveBeenCalledWith(expect.objectContaining({ id: 81 })));
    expect(mockCompleteInterview).not.toHaveBeenCalled();
  });

  it('completes a scheduled selected interview with its own id before submitting evaluation', async () => {
    await render(
      <InterviewEvaluationModal
        canManageApplications
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Scheduled)}
        onClose={jest.fn()}
        visible
      />,
    );
    await fireEvent.press(screen.getByTestId('submit-evaluation'));

    await waitFor(() => expect(mockEvaluateInterview).toHaveBeenCalledWith(expect.objectContaining({ id: 81 })));
    expect(mockCompleteInterview).toHaveBeenCalledWith(81);
    expect(mockCompleteInterview.mock.invocationCallOrder[0]).toBeLessThan(
      mockEvaluateInterview.mock.invocationCallOrder[0],
    );
    expect(mockEvaluateInterview.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ id: 81 }));
    expect(mockEvaluateInterview.mock.calls[0]?.[0]).not.toEqual(expect.objectContaining({ id: 3 }));
  });

  it('surfaces completion failures and does not submit an evaluation afterward', async () => {
    const completionFailure = new Error('interview completion failed');
    mockCompleteInterview.mockRejectedValue(completionFailure);
    await render(
      <InterviewEvaluationModal
        canManageApplications
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Scheduled)}
        onClose={jest.fn()}
        visible
      />,
    );
    await fireEvent.press(screen.getByTestId('submit-evaluation'));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith(completionFailure, 'common.error'));
    expect(mockCompleteInterview).toHaveBeenCalledWith(81);
    expect(mockEvaluateInterview).not.toHaveBeenCalled();
  });

  it('requires EvaluateInterviews even for a completed interview', async () => {
    await render(
      <InterviewEvaluationModal
        canManageApplications
        canEvaluateInterviews={false}
        interview={createInterview(InterviewStatus.Completed)}
        onClose={jest.fn()}
        visible
      />,
    );

    expect(screen.getByTestId('submit-evaluation').props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('submit-evaluation'));
    expect(mockEvaluateInterview).not.toHaveBeenCalled();
    expect(mockCompleteInterview).not.toHaveBeenCalled();
  });

  it('keeps evaluation unavailable until a non-empty scorecard is ready', async () => {
    mockUseScorecardTemplate.mockReturnValueOnce({ isError: false, isLoading: true, refetch });
    await render(
      <InterviewEvaluationModal
        canManageApplications={false}
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Completed)}
        onClose={jest.fn()}
        visible
      />,
    );

    expect(screen.getByTestId('scorecard-loading')).toBeTruthy();
    expect(screen.getByTestId('submit-evaluation').props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('submit-evaluation'));
    expect(mockEvaluateInterview).not.toHaveBeenCalled();

    mockUseScorecardTemplate.mockReturnValue({
      data: createScorecard([]),
      isError: false,
      isLoading: false,
      refetch,
    });
    await screen.rerender(
      <InterviewEvaluationModal
        canManageApplications={false}
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Completed)}
        onClose={jest.fn()}
        visible
      />,
    );
    expect(screen.getByTestId('scorecard-empty')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('submit-evaluation'));
    expect(mockEvaluateInterview).not.toHaveBeenCalled();
  });

  it('exposes a retryable error state when the selected interview scorecard fails to load', async () => {
    mockUseScorecardTemplate.mockReturnValue({ data: undefined, isError: true, isLoading: false, refetch });
    await render(
      <InterviewEvaluationModal
        canManageApplications={false}
        canEvaluateInterviews
        interview={createInterview(InterviewStatus.Completed)}
        onClose={jest.fn()}
        visible
      />,
    );

    await fireEvent.press(screen.getByTestId('retry-scorecard'));
    expect(screen.getByTestId('scorecard-error')).toBeTruthy();
    expect(refetch).toHaveBeenCalled();
  });
});
