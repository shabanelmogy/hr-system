import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type { RejectWorkforcePlanMutation, WorkforcePlanActionMutation, WorkforcePlanDetail, WorkforcePlanMutationRequest, WorkforcePlanPageQuery, WorkforcePlanPageResponse, UpdateWorkforcePlanMutation } from "../types/WorkforcePlan";

export default class WorkforcePlanService {
  static getPage(query: WorkforcePlanPageQuery): Promise<WorkforcePlanPageResponse> { return apiService.get(apiRoutes.workforcePlanning.plans, { ...query }); }
  static getById(id: number): Promise<WorkforcePlanDetail> { return apiService.get(apiRoutes.workforcePlanning.plan(id)); }
  static create(request: WorkforcePlanMutationRequest): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.plans, request); }
  static update({ id, request }: UpdateWorkforcePlanMutation): Promise<WorkforcePlanDetail> { return apiService.put(apiRoutes.workforcePlanning.plan(id), request); }
  static async archive({ id, rowVersion }: WorkforcePlanActionMutation): Promise<void> { await apiService.delete(apiRoutes.workforcePlanning.plan(id), { rowVersion }); }
  static restore({ id, rowVersion }: WorkforcePlanActionMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.restore(id), { rowVersion }); }
  static getRevisions(id: number): Promise<WorkforcePlanDetail[]> { return apiService.get(apiRoutes.workforcePlanning.revisions(id)); }
  static submit({ id, rowVersion }: WorkforcePlanActionMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.submit(id), { rowVersion }); }
  static beginReview({ id, rowVersion }: WorkforcePlanActionMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.beginReview(id), { rowVersion }); }
  static approve({ id, rowVersion }: WorkforcePlanActionMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.approve(id), { rowVersion }); }
  static reject({ id, reason, rowVersion }: RejectWorkforcePlanMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.reject(id), { reason, rowVersion }); }
  static createRevision({ id, rowVersion }: WorkforcePlanActionMutation): Promise<WorkforcePlanDetail> { return apiService.post(apiRoutes.workforcePlanning.revisions(id), { rowVersion }); }
}
