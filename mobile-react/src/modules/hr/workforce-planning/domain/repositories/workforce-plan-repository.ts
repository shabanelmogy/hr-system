import type { WorkforcePlanningPage } from '../models/page';
import type {
  RejectWorkforcePlanAction,
  UpdateWorkforcePlanRequest,
  WorkforcePlan,
  WorkforcePlanAction,
  WorkforcePlanDetail,
  WorkforcePlanPageQuery,
  WorkforcePlanRequest,
} from '../models/workforce-plan';

export interface WorkforcePlanRepository {
  getPage(query: WorkforcePlanPageQuery): Promise<WorkforcePlanningPage<WorkforcePlan>>;
  getById(id: number): Promise<WorkforcePlanDetail>;
  getRevisions(id: number): Promise<WorkforcePlanDetail[]>;
  create(request: WorkforcePlanRequest): Promise<WorkforcePlanDetail>;
  update(id: number, request: UpdateWorkforcePlanRequest): Promise<WorkforcePlanDetail>;
  archive(action: WorkforcePlanAction): Promise<void>;
  restore(action: WorkforcePlanAction): Promise<WorkforcePlanDetail>;
  submit(action: WorkforcePlanAction): Promise<WorkforcePlanDetail>;
  beginReview(action: WorkforcePlanAction): Promise<WorkforcePlanDetail>;
  approve(action: WorkforcePlanAction): Promise<WorkforcePlanDetail>;
  reject(action: RejectWorkforcePlanAction): Promise<WorkforcePlanDetail>;
  createRevision(action: WorkforcePlanAction): Promise<WorkforcePlanDetail>;
}
