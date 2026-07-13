import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import fileService, { FileService } from "../services/fileService";
import type { FileItem, UploadResult } from "../types/File";

// Query Keys
export const fileKeys = {
  all: ["files"] as const,
  list: () => [...fileKeys.all, "list"] as const,
  detail: (id: number) => [...fileKeys.all, "detail", id] as const,
};

// Query Hooks
export const useFiles = (options?: UseQueryOptions<FileItem[], Error>) =>
  useQuery({
    queryKey: fileKeys.list(),
    queryFn: FileService.getAll,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useFile = (id: number | null | undefined, options?: UseQueryOptions<FileItem, Error>) =>
  useQuery({
    queryKey: fileKeys.detail(id!),
    queryFn: () => FileService.getById(id!),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// Generic Mutation Hook Factory
function useFileMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context, undefined);
      }
    },
  });
}

export const useUploadFiles = (options?: UseMutationOptions<UploadResult, Error, File[]>) =>
  useFileMutation(FileService.uploadMany, options);


export const useDownloadFile = (options?: UseMutationOptions<void, Error, {storedFileName: string, fileName: string}>) =>
  useMutation({
    mutationFn: async ({storedFileName, fileName}) => {
      const result = await fileService.downloadFile(storedFileName, fileName);
      if (!result.success) {
        throw new Error(result.errorResponse?.errors?.general?.[0] || "Download failed");
      }
    },
    ...options,
  });


export const useDeleteFile = (options?: UseMutationOptions<string, Error, string>) =>
  useFileMutation<string, string>(FileService.delete, options);

// Utility Hook
export const useInvalidateFiles = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: fileKeys.all });
};
