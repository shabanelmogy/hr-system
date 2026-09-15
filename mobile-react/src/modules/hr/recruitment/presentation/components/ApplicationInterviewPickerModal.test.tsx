/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { InterviewStatus, InterviewType, type InterviewDto } from '../../domain/models/recruitment';
import { ApplicationInterviewPickerModal } from './ApplicationInterviewPickerModal';

const mockUseInterviews = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}));
jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: { primary: '#00f', success: '#0a0' } } }),
}));
jest.mock('../queries/use-recruitment', () => ({
  useInterviews: (...args: unknown[]) => mockUseInterviews(...args),
}));
jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppCard: ({ children, onPress, testID }: { children: React.ReactNode; onPress: () => void; testID: string }) => (
      <Pressable onPress={onPress} testID={testID}>{children}</Pressable>
    ),
    AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) => (
      visible ? <View testID="interview-picker">{children}</View> : null
    ),
    AppPaginationNavigation: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
      <Pressable onPress={() => onPageChange(1)} testID="interview-pagination"><Text>next</Text></Pressable>
    ),
    AppStateView: ({ message, onRetry, state }: { message?: string; onRetry?: () => void; state: string }) => (
      <View testID={`state-${state}`}>
        {message ? <Text>{message}</Text> : null}
        {onRetry ? <Pressable onPress={onRetry} testID="retry-interviews" /> : null}
      </View>
    ),
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

function createInterview(id: number, status: InterviewStatus): InterviewDto {
  return {
    id,
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

function createInterviewPage(items: InterviewDto[], totalCount = items.length, totalPages = 1) {
  return {
    items,
    metaData: {
      currentPage: 1,
      totalPages,
      pageSize: 10,
      pageNumber: 1,
      totalCount,
      hasPrev: false,
      hasNext: false,
    },
  };
}

describe('ApplicationInterviewPickerModal', () => {
  const refetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInterviews.mockReturnValue({
      data: createInterviewPage([
        createInterview(81, InterviewStatus.Completed),
        createInterview(82, InterviewStatus.Scheduled),
        createInterview(83, InterviewStatus.Cancelled),
        createInterview(84, InterviewStatus.NoShow),
      ]),
      isError: false,
      isLoading: false,
      refetch,
    });
  });

  it('uses the application only as the list filter and selects an actual completed interview', async () => {
    const onSelect = jest.fn();
    await render(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications={false}
        onClose={jest.fn()}
        onSelect={onSelect}
        visible
      />,
    );

    expect(mockUseInterviews).toHaveBeenCalledWith(
      { pageNumber: 1, pageSize: 10, applicationId: 3 },
      true,
    );
    expect(screen.getByTestId('recruitment-interview-81')).toBeTruthy();
    expect(screen.queryByTestId('recruitment-interview-82')).toBeNull();
    expect(screen.queryByTestId('recruitment-interview-83')).toBeNull();
    expect(screen.queryByTestId('recruitment-interview-84')).toBeNull();

    await fireEvent.press(screen.getByTestId('recruitment-interview-81'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 81, employmentApplicationId: 3 }));
    expect(onSelect).not.toHaveBeenCalledWith(3);
  });

  it('requires both permissions for scheduled interviews while evaluation alone can select completed ones', async () => {
    await render(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications={false}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );

    expect(screen.getByTestId('recruitment-interview-81')).toBeTruthy();
    expect(screen.queryByTestId('recruitment-interview-82')).toBeNull();
    expect(screen.queryByTestId('recruitment-interview-83')).toBeNull();
    expect(screen.queryByTestId('recruitment-interview-84')).toBeNull();

    await screen.rerender(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );
    expect(screen.getByTestId('recruitment-interview-82')).toBeTruthy();

    await screen.rerender(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews={false}
        canManageApplications
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );
    expect(screen.queryByTestId('recruitment-interview-81')).toBeNull();
    expect(screen.queryByTestId('recruitment-interview-82')).toBeNull();
  });

  it('keeps later eligible pages reachable when the current page contains only cancelled interviews', async () => {
    const cancelled = createInterview(83, InterviewStatus.Cancelled);
    const completed = createInterview(91, InterviewStatus.Completed);
    const onSelect = jest.fn();
    mockUseInterviews.mockImplementation((query: { pageNumber: number }) => ({
      data: query.pageNumber === 1
        ? createInterviewPage([cancelled], 11, 2)
        : createInterviewPage([completed], 11, 2),
      isError: false,
      isLoading: false,
      refetch,
    }));

    await render(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications
        onClose={jest.fn()}
        onSelect={onSelect}
        visible
      />,
    );
    expect(screen.getByTestId('state-empty')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('interview-pagination'));

    expect(mockUseInterviews).toHaveBeenLastCalledWith(
      { pageNumber: 2, pageSize: 10, applicationId: 3 },
      true,
    );
    expect(screen.getByTestId('recruitment-interview-91')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('recruitment-interview-91'));
    expect(onSelect).toHaveBeenCalledWith(completed);
  });

  it('shows the shared loading, empty, and retryable error states', async () => {
    mockUseInterviews.mockReturnValueOnce({ isLoading: true, isError: false });
    await render(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );
    expect(screen.getByTestId('state-loading')).toBeTruthy();

    mockUseInterviews.mockReturnValueOnce({ data: createInterviewPage([], 0), isError: false, isLoading: false });
    await screen.rerender(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );
    expect(screen.getByTestId('state-empty')).toBeTruthy();

    mockUseInterviews.mockReturnValueOnce({ data: undefined, isError: true, isLoading: false, refetch });
    await screen.rerender(
      <ApplicationInterviewPickerModal
        applicationId={3}
        canEvaluateInterviews
        canManageApplications
        onClose={jest.fn()}
        onSelect={jest.fn()}
        visible
      />,
    );
    await fireEvent.press(screen.getByTestId('retry-interviews'));
    expect(screen.getByTestId('state-error')).toBeTruthy();
    expect(refetch).toHaveBeenCalled();
  });
});
