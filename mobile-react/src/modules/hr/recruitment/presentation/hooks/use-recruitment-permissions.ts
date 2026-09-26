import { useAuth, isAuthorized, permissions } from '@/src/platform/auth';

export function useRecruitmentPermissions() {
  const { session } = useAuth();

  return {
    canView: isAuthorized(session, { permissions: [permissions.ViewRecruitment] }),
    canManageRequisitions: isAuthorized(session, { permissions: [permissions.CreateJobRequisitions, permissions.SubmitJobRequisitions, permissions.CancelJobRequisitions], permissionMode: 'all' }),
    canApproveRequisitions: isAuthorized(session, { permissions: [permissions.ReviewJobRequisitions] }),
    canManageOpenings: isAuthorized(session, { permissions: [permissions.CreateJobOpenings, permissions.OpenJobOpenings, permissions.PauseJobOpenings, permissions.CloseJobOpenings], permissionMode: 'all' }),
    canManageCandidates: isAuthorized(session, { permissions: [permissions.CreateCandidates, permissions.EditCandidates], permissionMode: 'all' }),
    canManageApplications: isAuthorized(session, { permissions: [permissions.CreateEmploymentApplications, permissions.MoveEmploymentApplications, permissions.RejectEmploymentApplications, permissions.WithdrawEmploymentApplications], permissionMode: 'all' }),
    canEvaluateInterviews: isAuthorized(session, { permissions: [permissions.EvaluateInterviews] }),
    canManageOffers: isAuthorized(session, { permissions: [permissions.CreateJobOffers, permissions.SubmitJobOffers, permissions.IssueJobOffers, permissions.RespondJobOffers], permissionMode: 'all' }),
    canApproveOffers: isAuthorized(session, { permissions: [permissions.ReviewJobOffers] }),
    canHire: isAuthorized(session, { permissions: [permissions.HireCandidate] }),
  };
}
