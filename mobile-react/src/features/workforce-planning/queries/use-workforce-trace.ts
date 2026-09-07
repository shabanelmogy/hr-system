import { useQuery } from '@tanstack/react-query';
import { workforceTraceApi } from '../api/workforce-trace-api';
import type { PlanCommitmentPageQuery } from '../types/workforce-trace';
export const workforceTraceKeys = { all: ['workforce-trace'] as const, application: (id: number) => [...workforceTraceKeys.all, 'application', id] as const, offer: (id: number) => [...workforceTraceKeys.all, 'offer', id] as const, employee: (id: number) => [...workforceTraceKeys.all, 'employee', id] as const, commitment: (query: PlanCommitmentPageQuery) => [...workforceTraceKeys.all, 'commitment', query] as const };
export const useWorkforceTraceByApplication = (id: number | null, enabled = true) => useQuery({ queryKey: workforceTraceKeys.application(id ?? 0), queryFn: () => workforceTraceApi.byApplication(id!), enabled: enabled && !!id });
export const useWorkforceTraceByOffer = (id: number | null, enabled = true) => useQuery({ queryKey: workforceTraceKeys.offer(id ?? 0), queryFn: () => workforceTraceApi.byOffer(id!), enabled: enabled && !!id });
export const useWorkforceTraceByEmployee = (id: number | null, enabled = true) => useQuery({ queryKey: workforceTraceKeys.employee(id ?? 0), queryFn: () => workforceTraceApi.byEmployee(id!), enabled: enabled && !!id });
export const usePlanCommitmentSummary = (query: PlanCommitmentPageQuery | null) => useQuery({ queryKey: workforceTraceKeys.commitment(query ?? { fiscalYearId: 0, pageNumber: 1, pageSize: 10 }), queryFn: () => workforceTraceApi.commitment(query!), enabled: !!query?.fiscalYearId });
