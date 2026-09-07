import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffingApi } from '../api/staffing-api';
import type { EnvelopeAmendmentPageQuery, EnvelopeAmendmentRequest, StaffingAction, StaffingCloseAction, StaffingRejectAction, StaffingRequestInput, StaffingRequestPageQuery } from '../types/staffing';
import { positionEnvelopeKeys } from './use-workforce-budgets';

export const envelopeAmendmentKeys = { all: ['envelope-amendments'] as const, list: (query: EnvelopeAmendmentPageQuery) => [...envelopeAmendmentKeys.all, 'list', query] as const, detail: (id: number) => [...envelopeAmendmentKeys.all, 'detail', id] as const };
export const staffingRequestKeys = { all: ['staffing-requests'] as const, list: (query: StaffingRequestPageQuery) => [...staffingRequestKeys.all, 'list', query] as const, detail: (id: number) => [...staffingRequestKeys.all, 'detail', id] as const };
export const useEnvelopeAmendments = (query: EnvelopeAmendmentPageQuery) => useQuery({ queryKey: envelopeAmendmentKeys.list(query), queryFn: () => staffingApi.getAmendments(query), placeholderData: previous => previous });
export const useEnvelopeAmendment = (id: number | null, enabled = true) => useQuery({ queryKey: envelopeAmendmentKeys.detail(id ?? 0), queryFn: () => staffingApi.getAmendment(id!), enabled: enabled && !!id });
export const useStaffingRequests = (query: StaffingRequestPageQuery) => useQuery({ queryKey: staffingRequestKeys.list(query), queryFn: () => staffingApi.getRequests(query), placeholderData: previous => previous });
export const useStaffingRequest = (id: number | null, enabled = true) => useQuery({ queryKey: staffingRequestKeys.detail(id ?? 0), queryFn: () => staffingApi.getRequest(id!), enabled: enabled && !!id });
function useStaffingMutation<T, R>(mutationFn: (value: T) => Promise<R>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => { await client.invalidateQueries({ queryKey: envelopeAmendmentKeys.all }); await client.invalidateQueries({ queryKey: staffingRequestKeys.all }); await client.invalidateQueries({ queryKey: positionEnvelopeKeys.all }); } }); }
export const useCreateEnvelopeAmendment = () => useStaffingMutation((request: EnvelopeAmendmentRequest) => staffingApi.createAmendment(request));
export const useSubmitEnvelopeAmendment = () => useStaffingMutation((action: StaffingAction) => staffingApi.submitAmendment(action));
export const useApproveEnvelopeAmendment = () => useStaffingMutation((action: StaffingAction) => staffingApi.approveAmendment(action));
export const useRejectEnvelopeAmendment = () => useStaffingMutation((action: StaffingRejectAction) => staffingApi.rejectAmendment(action));
export const useCreateStaffingRequest = () => useStaffingMutation((request: StaffingRequestInput) => staffingApi.createRequest(request));
export const useSubmitStaffingRequest = () => useStaffingMutation((action: StaffingAction) => staffingApi.submitRequest(action));
export const useApproveStaffingRequest = () => useStaffingMutation((action: StaffingAction) => staffingApi.approveRequest(action));
export const useRejectStaffingRequest = () => useStaffingMutation((action: StaffingRejectAction) => staffingApi.rejectRequest(action));
export const useCloseStaffingRequest = () => useStaffingMutation((action: StaffingCloseAction) => staffingApi.closeRequest(action));
