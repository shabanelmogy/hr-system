/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import {
  ApplicationSource,
  ApplicationStatus,
  type EmploymentApplicationDto,
} from '../../domain/models/recruitment';
import { CandidatePipelineCard } from './CandidatePipelineCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}));
jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: {
    border: '#ccc', danger: '#f00', primary: '#00f', success: '#0a0', surface: '#fff', textMuted: '#666',
  } } }),
}));
jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    AppButton: ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
      <Pressable onPress={onPress} testID={`action-${children}`}><Text>{children}</Text></Pressable>
    ),
    AppIcon: () => null,
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

function createApplication(status: ApplicationStatus): EmploymentApplicationDto {
  return {
    id: 3,
    publicId: '2fdb4610-d0ad-4863-9c82-900000000003',
    candidateId: 4,
    candidateName: 'Sam Applicant',
    candidateEmail: 'sam@example.com',
    candidatePhone: null,
    jobOpeningId: 5,
    openingNumber: 'OPEN-5',
    positionTitleAr: 'محاسب',
    positionTitleEn: 'Accountant',
    departmentNameEn: 'Finance',
    departmentNameAr: 'المالية',
    branchNameAr: 'الفرع',
    branchNameEn: 'Branch',
    jobPostingId: null,
    source: ApplicationSource.CareersPortal,
    status,
    coverLetter: null,
    resumeFileId: null,
    expectedSalary: null,
    expectedSalaryCurrencyCode: null,
    availableFrom: null,
    submittedOn: '2026-09-10T12:00:00Z',
    lastStatusChangedOn: '2026-09-10T12:00:00Z',
    employeeId: null,
    interviewsCount: 1,
    averageEvaluationScore: null,
    statusHistory: [],
  };
}

describe('CandidatePipelineCard interview actions', () => {
  it('allows evaluation only for interview-stage application statuses and offers only after Interviewed', async () => {
    await render(
      <CandidatePipelineCard
        application={createApplication(ApplicationStatus.InterviewScheduled)}
        onEvaluateInterview={jest.fn()}
        onMakeOffer={jest.fn()}
      />,
    );

    expect(screen.getByTestId('action-recruitment.actions.evaluate')).toBeTruthy();
    expect(screen.queryByTestId('action-recruitment.actions.makeOffer')).toBeNull();

    await screen.rerender(
      <CandidatePipelineCard
        application={createApplication(ApplicationStatus.Interviewed)}
        onEvaluateInterview={jest.fn()}
        onMakeOffer={jest.fn()}
      />,
    );
    expect(screen.getByTestId('action-recruitment.actions.evaluate')).toBeTruthy();
    expect(screen.getByTestId('action-recruitment.actions.makeOffer')).toBeTruthy();

    await screen.rerender(
      <CandidatePipelineCard
        application={createApplication(ApplicationStatus.OfferIssued)}
        onEvaluateInterview={jest.fn()}
        onMakeOffer={jest.fn()}
      />,
    );
    expect(screen.queryByTestId('action-recruitment.actions.evaluate')).toBeNull();
    expect(screen.queryByTestId('action-recruitment.actions.makeOffer')).toBeNull();
  });

  it('renders schedule action only when its caller supplies the ManageApplications-gated handler', async () => {
    const application = createApplication(ApplicationStatus.Shortlisted);
    const onScheduleInterview = jest.fn();
    await render(<CandidatePipelineCard application={application} />);
    expect(screen.queryByTestId('action-recruitment.actions.scheduleInterview')).toBeNull();

    await screen.rerender(<CandidatePipelineCard application={application} onScheduleInterview={onScheduleInterview} />);
    expect(screen.getByTestId('action-recruitment.actions.scheduleInterview')).toBeTruthy();
  });
});
