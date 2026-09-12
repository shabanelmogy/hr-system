import type { WorkforcePlanningPage } from '../models/page';
import type { PositionEnvelope, PositionEnvelopeDetail, PositionEnvelopePageQuery } from '../models/workforce-budget';

export interface PositionEnvelopeRepository {
  getPage(query: PositionEnvelopePageQuery): Promise<WorkforcePlanningPage<PositionEnvelope>>;
  getById(id: number): Promise<PositionEnvelopeDetail>;
}
