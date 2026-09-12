import { createOrganizationalStructureUseCases } from '../application/organizational-structure-use-cases';
import { organizationalStructureRemoteDataSource } from '../data/remote/organizational-structure-remote-data-source';
import { DefaultOrganizationalStructureRepository } from '../data/repositories/default-organizational-structure-repository';

const organizationalStructureUseCases = createOrganizationalStructureUseCases(
  new DefaultOrganizationalStructureRepository(organizationalStructureRemoteDataSource),
);

export function useOrganizationalStructureUseCases() {
  return organizationalStructureUseCases;
}
