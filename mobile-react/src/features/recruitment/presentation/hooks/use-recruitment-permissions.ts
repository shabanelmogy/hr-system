import { useAuth, isAuthorized, permissions } from '@/src/features/auth';

export function useRecruitmentPermissions() {
  const { session } = useAuth();

  return {
    canView: isAuthorized(session, { permissions: [permissions.ViewRecruitment] }),
    canManageRequisitions: isAuthorized(session, { permissions: [permissions.ManageJobRequisitions] }),
    canApproveRequisitions: isAuthorized(session, { permissions: [permissions.ApproveJobRequisitions] }),
    canManageOpenings: isAuthorized(session, { permissions: [permissions.ManageJobOpenings] }),
    canManageCandidates: isAuthorized(session, { permissions: [permissions.ManageCandidates] }),
    canManageApplications: isAuthorized(session, { permissions: [permissions.ManageApplications] }),
    canEvaluateInterviews: isAuthorized(session, { permissions: [permissions.EvaluateInterviews] }),
    canManageOffers: isAuthorized(session, { permissions: [permissions.ManageJobOffers] }),
    canApproveOffers: isAuthorized(session, { permissions: [permissions.ApproveJobOffers] }),
    canHire: isAuthorized(session, { permissions: [permissions.HireCandidate] }),
  };
}
