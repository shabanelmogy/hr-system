import type { RecruitmentRepository } from '../../domain/repositories/recruitment-repository';
import type { RecruitmentRemoteDataSource } from '../remote/recruitment-remote-data-source';

/**
 * Recruitment writes are deliberately server-authoritative. This repository
 * has no local write store and no outbox/replay path.
 */
export class DefaultRecruitmentRepository implements RecruitmentRepository {
  constructor(private readonly remote: RecruitmentRemoteDataSource) {}

  getSummary() { return this.remote.getSummary(); }
  getOpenings(params?: Parameters<RecruitmentRepository['getOpenings']>[0]) { return this.remote.getOpenings(params); }
  getOpeningById(id: number) { return this.remote.getOpeningById(id); }
  openOpening(id: number) { return this.remote.openOpening(id); }
  pauseOpening(id: number, reason?: string) { return this.remote.pauseOpening(id, reason); }
  closeOpening(id: number, reason?: string) { return this.remote.closeOpening(id, reason); }

  getApplications(params?: Parameters<RecruitmentRepository['getApplications']>[0]) { return this.remote.getApplications(params); }
  getApplicationById(id: number) { return this.remote.getApplicationById(id); }
  changeStage(id: number, request: Parameters<RecruitmentRepository['changeStage']>[1]) { return this.remote.changeStage(id, request); }
  createCandidate(request: Parameters<RecruitmentRepository['createCandidate']>[0]) { return this.remote.createCandidate(request); }
  submitApplication(request: Parameters<RecruitmentRepository['submitApplication']>[0]) { return this.remote.submitApplication(request); }
  hireCandidate(id: number, request: Parameters<RecruitmentRepository['hireCandidate']>[1]) { return this.remote.hireCandidate(id, request); }

  scheduleInterview(request: Parameters<RecruitmentRepository['scheduleInterview']>[0]) { return this.remote.scheduleInterview(request); }
  completeInterview(id: number) { return this.remote.completeInterview(id); }
  evaluateInterview(id: number, request: Parameters<RecruitmentRepository['evaluateInterview']>[1]) { return this.remote.evaluateInterview(id, request); }
  getScorecardTemplate(interviewId: number) { return this.remote.getScorecardTemplate(interviewId); }

  getOffers(params?: Parameters<RecruitmentRepository['getOffers']>[0]) { return this.remote.getOffers(params); }
  createOffer(request: Parameters<RecruitmentRepository['createOffer']>[0]) { return this.remote.createOffer(request); }
  issueOffer(id: number) { return this.remote.issueOffer(id); }
  submitOffer(id: number) { return this.remote.submitOffer(id); }
  approveOffer(id: number) { return this.remote.approveOffer(id); }
  rejectOffer(id: number, reason: string) { return this.remote.rejectOffer(id, reason); }

  getRequisitions(params?: Parameters<RecruitmentRepository['getRequisitions']>[0]) { return this.remote.getRequisitions(params); }
  getRequisitionById(id: number) { return this.remote.getRequisitionById(id); }
  getPositionHeadcountSummary(positionId: number) { return this.remote.getPositionHeadcountSummary(positionId); }
  getApprovedStaffingRequestOptions() { return this.remote.getApprovedStaffingRequestOptions(); }
  createRequisition(request: Parameters<RecruitmentRepository['createRequisition']>[0]) { return this.remote.createRequisition(request); }
  submitRequisition(id: number) { return this.remote.submitRequisition(id); }
  approveRequisition(id: number) { return this.remote.approveRequisition(id); }
  rejectRequisition(id: number, reason: string) { return this.remote.rejectRequisition(id, reason); }
  cancelRequisition(id: number, reason: string) { return this.remote.cancelRequisition(id, reason); }

  getSettings() { return this.remote.getSettings(); }
  updateSettings(settings: Parameters<RecruitmentRepository['updateSettings']>[0]) { return this.remote.updateSettings(settings); }
}
