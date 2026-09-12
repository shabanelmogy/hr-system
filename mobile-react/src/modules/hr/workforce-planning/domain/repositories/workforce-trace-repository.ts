import type { WorkforcePlanningPage } from '../models/page';
import type { HiringTrace, PlanCommitmentPageQuery, PlanCommitmentRow } from '../models/workforce-trace';

export interface WorkforceTraceRepository {
  byApplication(id: number): Promise<HiringTrace>;
  byOffer(id: number): Promise<HiringTrace>;
  byEmployee(id: number): Promise<HiringTrace>;
  commitment(query: PlanCommitmentPageQuery): Promise<WorkforcePlanningPage<PlanCommitmentRow>>;
}
