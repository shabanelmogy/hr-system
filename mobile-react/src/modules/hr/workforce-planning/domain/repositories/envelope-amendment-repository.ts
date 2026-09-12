import type { WorkforcePlanningPage } from '../models/page';
import type {
  EnvelopeAmendment,
  EnvelopeAmendmentDetail,
  EnvelopeAmendmentPageQuery,
  EnvelopeAmendmentRequest,
  StaffingAction,
  StaffingRejectAction,
} from '../models/staffing';

export interface EnvelopeAmendmentRepository {
  getPage(query: EnvelopeAmendmentPageQuery): Promise<WorkforcePlanningPage<EnvelopeAmendment>>;
  getById(id: number): Promise<EnvelopeAmendmentDetail>;
  create(request: EnvelopeAmendmentRequest): Promise<EnvelopeAmendmentDetail>;
  submit(action: StaffingAction): Promise<EnvelopeAmendmentDetail>;
  approve(action: StaffingAction): Promise<EnvelopeAmendmentDetail>;
  reject(action: StaffingRejectAction): Promise<EnvelopeAmendmentDetail>;
}
