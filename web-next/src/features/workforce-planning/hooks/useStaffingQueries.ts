import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StaffingService from "../services/staffingService";
import type {
  EnvelopeAmendmentMutation,
  EnvelopeAmendmentPageQuery,
  StaffingAction,
  StaffingCloseAction,
  StaffingRejectAction,
  StaffingRequestMutation,
  StaffingRequestPageQuery,
} from "../types/Staffing";
import { positionEnvelopeKeys } from "./useWorkforceBudgetQueries";

export const envelopeAmendmentKeys = {
  all: ["envelopeAmendments"] as const,
  page: (query: EnvelopeAmendmentPageQuery) => [...envelopeAmendmentKeys.all, "page", query] as const,
  detail: (id: number) => [...envelopeAmendmentKeys.all, "detail", id] as const,
};

export const staffingRequestKeys = {
  all: ["staffingRequests"] as const,
  page: (query: StaffingRequestPageQuery) => [...staffingRequestKeys.all, "page", query] as const,
  detail: (id: number) => [...staffingRequestKeys.all, "detail", id] as const,
};

export const useEnvelopeAmendments = (query: EnvelopeAmendmentPageQuery) => useQuery({ queryKey: envelopeAmendmentKeys.page(query), queryFn: () => StaffingService.getAmendments(query), placeholderData: previous => previous });
export const useEnvelopeAmendment = (id?: number | null, enabled = true) => useQuery({ queryKey: envelopeAmendmentKeys.detail(id ?? 0), queryFn: () => StaffingService.getAmendment(id!), enabled: enabled && !!id });
export const useStaffingRequests = (query: StaffingRequestPageQuery) => useQuery({ queryKey: staffingRequestKeys.page(query), queryFn: () => StaffingService.getRequests(query), placeholderData: previous => previous });
export const useStaffingRequest = (id?: number | null, enabled = true) => useQuery({ queryKey: staffingRequestKeys.detail(id ?? 0), queryFn: () => StaffingService.getRequest(id!), enabled: enabled && !!id });

function useStaffingMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: envelopeAmendmentKeys.all });
      await client.invalidateQueries({ queryKey: staffingRequestKeys.all });
      await client.invalidateQueries({ queryKey: positionEnvelopeKeys.all });
    },
  });
}

export const useCreateEnvelopeAmendment = () => useStaffingMutation((request: EnvelopeAmendmentMutation) => StaffingService.createAmendment(request));
export const useSubmitEnvelopeAmendment = () => useStaffingMutation((action: StaffingAction) => StaffingService.submitAmendment(action));
export const useApproveEnvelopeAmendment = () => useStaffingMutation((action: StaffingAction) => StaffingService.approveAmendment(action));
export const useRejectEnvelopeAmendment = () => useStaffingMutation((action: StaffingRejectAction) => StaffingService.rejectAmendment(action));
export const useCreateStaffingRequest = () => useStaffingMutation((request: StaffingRequestMutation) => StaffingService.createRequest(request));
export const useSubmitStaffingRequest = () => useStaffingMutation((action: StaffingAction) => StaffingService.submitRequest(action));
export const useApproveStaffingRequest = () => useStaffingMutation((action: StaffingAction) => StaffingService.approveRequest(action));
export const useRejectStaffingRequest = () => useStaffingMutation((action: StaffingRejectAction) => StaffingService.rejectRequest(action));
export const useCloseStaffingRequest = () => useStaffingMutation((action: StaffingCloseAction) => StaffingService.closeRequest(action));
