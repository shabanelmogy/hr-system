import { createFileManagerUseCases } from '../application/file-manager-use-cases';
import { DefaultFileManagerRepository } from '../data/repositories/default-file-manager-repository';

const fileManagerUseCases = createFileManagerUseCases(new DefaultFileManagerRepository());

export function useFileManagerUseCases() {
  return fileManagerUseCases;
}
