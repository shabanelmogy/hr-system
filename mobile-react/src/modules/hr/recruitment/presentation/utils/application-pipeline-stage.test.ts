import { ApplicationStage, ApplicationStatus } from '../../domain/models/recruitment';
import { getApplicationPipelineStage } from './application-pipeline-stage';

describe('getApplicationPipelineStage', () => {
  it.each([
    [ApplicationStatus.Draft, ApplicationStage.Applied],
    [ApplicationStatus.Submitted, ApplicationStage.Applied],
    [ApplicationStatus.UnderReview, ApplicationStage.Applied],
    [ApplicationStatus.Shortlisted, ApplicationStage.Shortlisted],
    [ApplicationStatus.InterviewScheduled, ApplicationStage.Interview],
    [ApplicationStatus.Interviewed, ApplicationStage.Interview],
    [ApplicationStatus.OfferIssued, ApplicationStage.Offer],
    [ApplicationStatus.OfferAccepted, ApplicationStage.Offer],
    [ApplicationStatus.OfferDeclined, ApplicationStage.Offer],
    [ApplicationStatus.Hired, ApplicationStage.Hired],
    [ApplicationStatus.Rejected, ApplicationStage.Rejected],
    [ApplicationStatus.Withdrawn, ApplicationStage.Withdrawn],
  ])('maps status %s to pipeline group %s', (status, stage) => {
    expect(getApplicationPipelineStage(status as ApplicationStatus)).toBe(stage);
  });
});
