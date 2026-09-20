import { apiService } from '@/src/core/api';
import { ApplicationStatus, InterviewStatus, InterviewType } from '../../domain/models/recruitment';
import { recruitmentEndpoints } from './recruitment-endpoints';
import { recruitmentRemoteDataSource } from './recruitment-remote-data-source';

jest.mock('@/src/core/api', () => ({
  apiService: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const applicationResponse = {
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
  source: 1,
  status: ApplicationStatus.UnderReview,
  coverLetter: null,
  resumeFileId: null,
  expectedSalary: null,
  expectedSalaryCurrencyCode: null,
  availableFrom: null,
  submittedOn: '2026-09-10T12:00:00Z',
  lastStatusChangedOn: '2026-09-10T12:00:00Z',
  employeeId: null,
  interviewsCount: 0,
  averageEvaluationScore: null,
  statusHistory: [
    {
      id: 1,
      fromStatus: null,
      toStatus: ApplicationStatus.Submitted,
      changedOn: '2026-09-10T12:00:00Z',
      reason: null,
      changedByEmployeeId: null,
    },
  ],
};

const summaryResponse = {
  totalOpenings: 2,
  totalActiveCandidates: 4,
  totalScheduledInterviews: 1,
  totalPendingOffers: 1,
  totalHiredCount: 1,
  stageCounts: { Submitted: 2, UnderReview: 2 },
};

const interviewResponse = {
  id: 8,
  employmentApplicationId: 3,
  candidateName: 'Sam Applicant',
  openingNumber: 'OPEN-5',
  positionTitleEn: 'Accountant',
  positionTitleAr: 'محاسب',
  type: InterviewType.Technical,
  status: InterviewStatus.Scheduled,
  startsOn: '2026-09-15T09:00:00Z',
  endsOn: '2026-09-15T10:00:00Z',
  completedOn: null,
  locationOrMeetingUrl: null,
  cancellationReason: null,
  participants: [{ id: 40, employeeId: 22, employeeName: 'Interviewer', isLead: true }],
  evaluations: [],
};

const interviewPageResponse = {
  items: [interviewResponse],
  metaData: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    pageNumber: 1,
    totalCount: 1,
    hasPrev: false,
    hasNext: false,
  },
};

describe('recruitment remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('parses the authoritative recruitment dashboard contract', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(summaryResponse);

    await expect(recruitmentRemoteDataSource.getSummary()).resolves.toEqual(summaryResponse);
  });

  it('parses current application fields including nullable values and history', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(applicationResponse);

    await expect(recruitmentRemoteDataSource.getApplicationById(3)).resolves.toEqual(applicationResponse);
  });

  it('parses the API interview participant and evaluation contract', async () => {
    (apiService.post as jest.Mock).mockResolvedValue(interviewResponse);

    await expect(recruitmentRemoteDataSource.scheduleInterview({
      employmentApplicationId: 3,
      type: InterviewType.Technical,
      startsOn: '2026-09-15T09:00:00Z',
      endsOn: '2026-09-15T10:00:00Z',
      participantEmployeeIds: [22],
    })).resolves.toEqual(interviewResponse);
  });

  it('uses applicationId only as the interviews page filter and parses separate interview IDs', async () => {
    const get = apiService.get as jest.Mock;
    get.mockResolvedValue(interviewPageResponse);

    await expect(recruitmentRemoteDataSource.getInterviews({
      pageNumber: 1,
      pageSize: 10,
      applicationId: applicationResponse.id,
    })).resolves.toEqual(interviewPageResponse);

    expect(get).toHaveBeenCalledWith(
      `${recruitmentEndpoints.interviews.base}?pageNumber=1&pageSize=10&applicationId=${applicationResponse.id}`,
    );
    expect(interviewPageResponse.items[0].id).not.toBe(applicationResponse.id);
    expect(get).not.toHaveBeenCalledWith(`recruitment/interviews/${applicationResponse.id}`);
  });

  it('uses the selected InterviewDto id for scorecard, completion, and evaluation routes', async () => {
    const interviewId = interviewResponse.id;
    const applicationId = interviewResponse.employmentApplicationId;
    const get = apiService.get as jest.Mock;
    const post = apiService.post as jest.Mock;
    get.mockResolvedValue({
      interviewId,
      employmentApplicationId: applicationId,
      candidateName: interviewResponse.candidateName,
      positionTitleEn: interviewResponse.positionTitleEn,
      positionTitleAr: interviewResponse.positionTitleAr,
      jobDescriptionId: null,
      skills: [],
    });
    post.mockResolvedValue(interviewResponse);

    await recruitmentRemoteDataSource.getScorecardTemplate(interviewId);
    await recruitmentRemoteDataSource.completeInterview(interviewId);
    await recruitmentRemoteDataSource.evaluateInterview(interviewId, {
      score: 4,
      recommendation: 2,
      skillEvaluations: [],
    });

    expect(get).toHaveBeenCalledWith(recruitmentEndpoints.interviews.scorecardTemplate(interviewId));
    expect(post).toHaveBeenNthCalledWith(1, recruitmentEndpoints.interviews.complete(interviewId), undefined);
    expect(post).toHaveBeenNthCalledWith(2, recruitmentEndpoints.interviews.evaluations(interviewId), {
      score: 4,
      recommendation: 2,
      skillEvaluations: [],
    });
    expect(interviewId).not.toBe(applicationId);
  });

  it('parses and returns the application returned by the hire endpoint', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue(applicationResponse);
    const request = { employeeNumber: 'EMP-42', hireDate: '2026-09-10', idempotencyKey: 'hire-42-stable-key' };

    await expect(recruitmentRemoteDataSource.hireCandidate(42, request)).resolves.toEqual(applicationResponse);
    expect(post).toHaveBeenCalledWith(recruitmentEndpoints.applications.hire(42), request);
  });

  it('sends only the API-supported application status filter', async () => {
    const get = apiService.get as jest.Mock;
    get.mockResolvedValue({ items: [], metaData: {
      currentPage: 1, totalPages: 0, pageSize: 25, pageNumber: 1, totalCount: 0, hasPrev: false, hasNext: false,
    } });

    await recruitmentRemoteDataSource.getApplications({ status: ApplicationStatus.Shortlisted });

    expect(get).toHaveBeenCalledWith(expect.stringContaining('status=4'));
    expect(get).toHaveBeenCalledWith(expect.not.stringContaining('stage='));
  });

  it('sends the move-stage request using the API targetStatus and reason contract', async () => {
    (apiService.post as jest.Mock).mockResolvedValue(applicationResponse);

    await recruitmentRemoteDataSource.changeStage(3, {
      targetStatus: ApplicationStatus.Rejected,
      reason: 'Not a fit',
    });

    expect(apiService.post).toHaveBeenCalledWith(recruitmentEndpoints.applications.moveStage(3), {
      targetStatus: ApplicationStatus.Rejected,
      reason: 'Not a fit',
    });
  });

  it('rejects malformed summary and application payloads', async () => {
    const get = apiService.get as jest.Mock;
    get.mockResolvedValueOnce({ totalOpenings: 1 });
    await expect(recruitmentRemoteDataSource.getSummary()).rejects.toMatchObject({ name: 'ZodError' });

    get.mockResolvedValueOnce({ ...applicationResponse, statusHistory: undefined });
    await expect(recruitmentRemoteDataSource.getApplicationById(3)).rejects.toMatchObject({ name: 'ZodError' });
  });

  it('rejects malformed interview response bodies', async () => {
    (apiService.post as jest.Mock).mockResolvedValue({ ...interviewResponse, participants: null });

    await expect(recruitmentRemoteDataSource.scheduleInterview({
      employmentApplicationId: 3,
      type: InterviewType.Technical,
      startsOn: '2026-09-15T09:00:00Z',
      endsOn: '2026-09-15T10:00:00Z',
    })).rejects.toMatchObject({ name: 'ZodError' });
  });
});
