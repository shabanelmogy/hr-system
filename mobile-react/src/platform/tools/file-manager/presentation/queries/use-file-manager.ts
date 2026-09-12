import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useFileManagerUseCases } from '../../composition/use-file-manager-use-cases';
import type { UploadFileAsset } from '../../domain/models/file-manager';

export const fileManagerKeys = {
  all: ['platform-tools', 'files'] as const,
};

export function useStoredFiles() {
  const useCases = useFileManagerUseCases();
  return useQuery({ queryKey: fileManagerKeys.all, queryFn: () => useCases.getFiles() });
}

export function useUploadFiles() {
  const useCases = useFileManagerUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: readonly UploadFileAsset[]) => useCases.uploadFiles(files),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: fileManagerKeys.all }),
  });
}

export function useDeleteFile() {
  const useCases = useFileManagerUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storedFileName: string) => useCases.deleteFile(storedFileName),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: fileManagerKeys.all }),
  });
}
