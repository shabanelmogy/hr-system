import { createEnvelopeAmendmentUseCases } from '../application/envelope-amendment-use-cases';
import { createPositionEnvelopeUseCases } from '../application/position-envelope-use-cases';
import { createStaffingRequestUseCases } from '../application/staffing-request-use-cases';
import { createWorkforceBudgetUseCases } from '../application/workforce-budget-use-cases';
import { createWorkforcePlanUseCases } from '../application/workforce-plan-use-cases';
import { createWorkforceTraceUseCases } from '../application/workforce-trace-use-cases';
import { DefaultEnvelopeAmendmentRepository } from '../data/repositories/default-envelope-amendment-repository';
import { DefaultPositionEnvelopeRepository } from '../data/repositories/default-position-envelope-repository';
import { DefaultStaffingRequestRepository } from '../data/repositories/default-staffing-request-repository';
import { DefaultWorkforceBudgetRepository } from '../data/repositories/default-workforce-budget-repository';
import { DefaultWorkforcePlanRepository } from '../data/repositories/default-workforce-plan-repository';
import { DefaultWorkforceTraceRepository } from '../data/repositories/default-workforce-trace-repository';

const workforcePlanUseCases = createWorkforcePlanUseCases(new DefaultWorkforcePlanRepository());
const workforceBudgetUseCases = createWorkforceBudgetUseCases(new DefaultWorkforceBudgetRepository());
const positionEnvelopeUseCases = createPositionEnvelopeUseCases(new DefaultPositionEnvelopeRepository());
const envelopeAmendmentUseCases = createEnvelopeAmendmentUseCases(new DefaultEnvelopeAmendmentRepository());
const staffingRequestUseCases = createStaffingRequestUseCases(new DefaultStaffingRequestRepository());
const workforceTraceUseCases = createWorkforceTraceUseCases(new DefaultWorkforceTraceRepository());

export const useWorkforcePlanUseCases = () => workforcePlanUseCases;
export const useWorkforceBudgetUseCases = () => workforceBudgetUseCases;
export const usePositionEnvelopeUseCases = () => positionEnvelopeUseCases;
export const useEnvelopeAmendmentUseCases = () => envelopeAmendmentUseCases;
export const useStaffingRequestUseCases = () => staffingRequestUseCases;
export const useWorkforceTraceUseCases = () => workforceTraceUseCases;
