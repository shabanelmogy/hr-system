import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';

const nullableString = z.string().nullable();
const amendmentStatus = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const requestStatus = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const requestType = z.union([z.literal(1), z.literal(2)]);
const priority = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export const envelopeAmendmentSchema = z.object({ id: z.number().int().positive(), envelopeId: z.number().int().positive(), envelopeCode: z.string(), additionalHeadcount: z.number().int().positive(), additionalSalaryCost: z.number().positive(), status: amendmentStatus, createdOn: z.string(), updatedOn: nullableString, rowVersion: z.string().min(1) });
export const envelopeAmendmentDetailSchema = envelopeAmendmentSchema.extend({ justification: z.string(), requestedById: nullableString, submittedOn: nullableString, submittedById: nullableString, approvedOn: nullableString, approvedById: nullableString, rejectedOn: nullableString, rejectedById: nullableString, decisionReason: nullableString });
export const envelopeAmendmentPageSchema = z.object({ items: z.array(envelopeAmendmentSchema), metaData: pageMetadataSchema });
export const staffingRequestSchema = z.object({ id: z.number().int().positive(), envelopeId: z.number().int().positive(), envelopeCode: z.string(), requestedHeadcount: z.number().int().positive(), estimatedAnnualSalaryPerSlot: z.number().nonnegative(), estimatedFiscalYearCostPerSlot: z.number().nonnegative(), totalReservedCost: z.number().nonnegative(), targetStartDate: z.string(), requestType, priority, status: requestStatus, remainingAllocatable: z.number().int().nonnegative(), remainingToHire: z.number().int().nonnegative(), createdOn: z.string(), rowVersion: z.string().min(1) });
export const staffingRequestDetailSchema = staffingRequestSchema.extend({ justification: z.string(), currencyCode: z.string().length(3), calculationPolicyVersion: z.string(), allocatedRequisitionPositions: z.number().int().nonnegative(), hiredPositions: z.number().int().nonnegative(), closeReason: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(), submittedOn: nullableString, submittedById: nullableString, approvedOn: nullableString, approvedById: nullableString, rejectedOn: nullableString, rejectedById: nullableString, decisionReason: nullableString, closedOn: nullableString, updatedOn: nullableString });
export const staffingRequestPageSchema = z.object({ items: z.array(staffingRequestSchema), metaData: pageMetadataSchema });
