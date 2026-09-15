import { ApplicationStage, ApplicationStatus } from '../../domain/models/recruitment';

/** Maps authoritative API statuses to the broader presentation pipeline groups. */
export function getApplicationPipelineStage(status: ApplicationStatus): ApplicationStage | null {
  switch (status) {
    case ApplicationStatus.Draft:
    case ApplicationStatus.Submitted:
    case ApplicationStatus.UnderReview:
      return ApplicationStage.Applied;
    case ApplicationStatus.Shortlisted:
      return ApplicationStage.Shortlisted;
    case ApplicationStatus.InterviewScheduled:
    case ApplicationStatus.Interviewed:
      return ApplicationStage.Interview;
    case ApplicationStatus.OfferIssued:
    case ApplicationStatus.OfferAccepted:
    case ApplicationStatus.OfferDeclined:
      return ApplicationStage.Offer;
    case ApplicationStatus.Hired:
      return ApplicationStage.Hired;
    case ApplicationStatus.Rejected:
      return ApplicationStage.Rejected;
    case ApplicationStatus.Withdrawn:
      return ApplicationStage.Withdrawn;
    default:
      return null;
  }
}
