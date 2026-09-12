import type { WorkforcePlanningPage } from '../models/page';
import type {
  StaffingAction,
  StaffingCloseAction,
  StaffingRejectAction,
  StaffingRequest,
  StaffingRequestDetail,
  StaffingRequestInput,
  StaffingRequestPageQuery,
} from '../models/staffing';

export interface StaffingRequestRepository {
  getPage(query: StaffingRequestPageQuery): Promise<WorkforcePlanningPage<StaffingRequest>>;
  getById(id: number): Promise<StaffingRequestDetail>;
  create(request: StaffingRequestInput): Promise<StaffingRequestDetail>;
  submit(action: StaffingAction): Promise<StaffingRequestDetail>;
  approve(action: StaffingAction): Promise<StaffingRequestDetail>;
  reject(action: StaffingRejectAction): Promise<StaffingRequestDetail>;
  close(action: StaffingCloseAction): Promise<StaffingRequestDetail>;
}
