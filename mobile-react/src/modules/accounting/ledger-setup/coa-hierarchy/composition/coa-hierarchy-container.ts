import { createCoaHierarchyUseCases } from '../application/coa-hierarchy-use-cases';
import { coaHierarchyRemoteDataSource } from '../data/remote/coa-hierarchy-remote-data-source';
import { DefaultCoaHierarchyRepository } from '../data/repositories/default-coa-hierarchy-repository';

export const coaHierarchyRepository = new DefaultCoaHierarchyRepository(coaHierarchyRemoteDataSource);
export const coaHierarchyUseCases = createCoaHierarchyUseCases(coaHierarchyRepository);
