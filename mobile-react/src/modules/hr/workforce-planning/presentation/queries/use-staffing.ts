import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEnvelopeAmendmentUseCases, useStaffingRequestUseCases } from '../../composition/use-workforce-planning-use-cases';
import type { EnvelopeAmendmentPageQuery, EnvelopeAmendmentRequest, StaffingAction, StaffingCloseAction, StaffingRejectAction, StaffingRequestInput, StaffingRequestPageQuery } from '../../domain/models/staffing';
import { positionEnvelopeKeys } from './use-workforce-budgets';

export const envelopeAmendmentKeys = { all: ['envelope-amendments'] as const, list: (query: EnvelopeAmendmentPageQuery) => [...envelopeAmendmentKeys.all, 'list', query] as const, detail: (id: number) => [...envelopeAmendmentKeys.all, 'detail', id] as const };
export const staffingRequestKeys = { all: ['staffing-requests'] as const, list: (query: StaffingRequestPageQuery) => [...staffingRequestKeys.all, 'list', query] as const, detail: (id: number) => [...staffingRequestKeys.all, 'detail', id] as const };
export const useEnvelopeAmendments = (query: EnvelopeAmendmentPageQuery) => { const useCases = useEnvelopeAmendmentUseCases(); return useQuery({ queryKey: envelopeAmendmentKeys.list(query), queryFn: () => useCases.getPage(query), placeholderData: previous => previous }); };
export const useEnvelopeAmendment = (id: number | null, enabled = true) => { const useCases = useEnvelopeAmendmentUseCases(); return useQuery({ queryKey: envelopeAmendmentKeys.detail(id ?? 0), queryFn: () => useCases.getById(id!), enabled: enabled && !!id }); };
export const useStaffingRequests = (query: StaffingRequestPageQuery) => { const useCases = useStaffingRequestUseCases(); return useQuery({ queryKey: staffingRequestKeys.list(query), queryFn: () => useCases.getPage(query), placeholderData: previous => previous }); };
export const useStaffingRequest = (id: number | null, enabled = true) => { const useCases = useStaffingRequestUseCases(); return useQuery({ queryKey: staffingRequestKeys.detail(id ?? 0), queryFn: () => useCases.getById(id!), enabled: enabled && !!id }); };
function useStaffingMutation<T, R>(mutationFn: (value: T) => Promise<R>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => { await client.invalidateQueries({ queryKey: envelopeAmendmentKeys.all }); await client.invalidateQueries({ queryKey: staffingRequestKeys.all }); await client.invalidateQueries({ queryKey: positionEnvelopeKeys.all }); } }); }
export const useCreateEnvelopeAmendment = () => { const useCases = useEnvelopeAmendmentUseCases(); return useStaffingMutation((request: EnvelopeAmendmentRequest) => useCases.create(request)); };
export const useSubmitEnvelopeAmendment = () => { const useCases = useEnvelopeAmendmentUseCases(); return useStaffingMutation((action: StaffingAction) => useCases.submit(action)); };
export const useApproveEnvelopeAmendment = () => { const useCases = useEnvelopeAmendmentUseCases(); return useStaffingMutation((action: StaffingAction) => useCases.approve(action)); };
export const useRejectEnvelopeAmendment = () => { const useCases = useEnvelopeAmendmentUseCases(); return useStaffingMutation((action: StaffingRejectAction) => useCases.reject(action)); };
export const useCreateStaffingRequest = () => { const useCases = useStaffingRequestUseCases(); return useStaffingMutation((request: StaffingRequestInput) => useCases.create(request)); };
export const useSubmitStaffingRequest = () => { const useCases = useStaffingRequestUseCases(); return useStaffingMutation((action: StaffingAction) => useCases.submit(action)); };
export const useApproveStaffingRequest = () => { const useCases = useStaffingRequestUseCases(); return useStaffingMutation((action: StaffingAction) => useCases.approve(action)); };
export const useRejectStaffingRequest = () => { const useCases = useStaffingRequestUseCases(); return useStaffingMutation((action: StaffingRejectAction) => useCases.reject(action)); };
export const useCloseStaffingRequest = () => { const useCases = useStaffingRequestUseCases(); return useStaffingMutation((action: StaffingCloseAction) => useCases.close(action)); };
