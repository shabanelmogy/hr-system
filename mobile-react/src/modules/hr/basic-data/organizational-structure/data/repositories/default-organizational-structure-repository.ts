import type { OrganizationalStructureRepository } from '../../domain/repositories/organizational-structure-repository';
import type { OrganizationalStructureRemoteDataSource } from '../remote/organizational-structure-remote-data-source';

export class DefaultOrganizationalStructureRepository implements OrganizationalStructureRepository {
  constructor(private readonly remote: OrganizationalStructureRemoteDataSource) {}

  getPage: OrganizationalStructureRepository['getPage'] = (query) => this.remote.getPage(query);
  getLookup: OrganizationalStructureRepository['getLookup'] = (resource, parentId) => this.remote.getLookup(resource, parentId);
  create: OrganizationalStructureRepository['create'] = (resource, request) => this.remote.create(resource, request);
  bulkCreate: OrganizationalStructureRepository['bulkCreate'] = (resource, requests) => this.remote.bulkCreate(resource, requests);
  update: OrganizationalStructureRepository['update'] = (resource, id, request) => this.remote.update(resource, id, request);
  archive: OrganizationalStructureRepository['archive'] = (resource, id) => this.remote.archive(resource, id);
  restore: OrganizationalStructureRepository['restore'] = (resource, id) => this.remote.restore(resource, id);
  approveJobDescription: OrganizationalStructureRepository['approveJobDescription'] = (id, request) => this.remote.approveJobDescription(id, request);
  rejectJobDescription: OrganizationalStructureRepository['rejectJobDescription'] = (id, reason) => this.remote.rejectJobDescription(id, reason);
  getChangeLogs: OrganizationalStructureRepository['getChangeLogs'] = (resource, id) => this.remote.getChangeLogs(resource, id);
}
