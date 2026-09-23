import type { AccountTreeNode } from '../../domain/models/coa-hierarchy';
import type { CoaHierarchyRepository } from '../../domain/repositories/coa-hierarchy-repository';
import type { CoaHierarchyRemoteDataSource } from '../remote/coa-hierarchy-remote-data-source';
import type { AccountTreeTransport } from '../remote/coa-hierarchy-schemas';

function flattenTree(nodes: readonly AccountTreeTransport[], parentAccountId: number | null = null, result: AccountTreeNode[] = []): AccountTreeNode[] {
  for (const node of nodes) {
    result.push({ id: node.id, code: node.code, nameAr: node.nameAr, nameEn: node.nameEn, allowPosting: node.allowPosting, parentAccountId });
    flattenTree(node.children, node.id, result);
  }
  return result;
}

export class DefaultCoaHierarchyRepository implements CoaHierarchyRepository {
  constructor(private readonly remote: CoaHierarchyRemoteDataSource) {}
  getAccountPage(query: Parameters<CoaHierarchyRepository['getAccountPage']>[0]) { return this.remote.getAccountPage(query); }
  async getAccountTree() { return flattenTree(await this.remote.getAccountTree()); }
  getAccount(id: number) { return this.remote.getAccount(id); }
  getAccountLookup() { return this.remote.getAccountLookup(); }
  getAccountCodeProposal() { return this.remote.getAccountCodeProposal(); }
  createAccount(request: Parameters<CoaHierarchyRepository['createAccount']>[0]) { return this.remote.createAccount(request); }
  updateAccount(id: number, request: Parameters<CoaHierarchyRepository['updateAccount']>[1], rowVersion: string) { return this.remote.updateAccount(id, request, rowVersion); }
  archiveAccount(id: number, rowVersion: string) { return this.remote.archiveAccount(id, rowVersion); }
  restoreAccount(id: number, rowVersion: string) { return this.remote.restoreAccount(id, rowVersion); }
  getHierarchyLevels(recordStatus: Parameters<CoaHierarchyRepository['getHierarchyLevels']>[0]) { return this.remote.getHierarchyLevels(recordStatus); }
  createHierarchyLevel(request: Parameters<CoaHierarchyRepository['createHierarchyLevel']>[0]) { return this.remote.createHierarchyLevel(request); }
  updateHierarchyLevel(id: number, request: Parameters<CoaHierarchyRepository['updateHierarchyLevel']>[1], rowVersion: string) { return this.remote.updateHierarchyLevel(id, request, rowVersion); }
  archiveHierarchyLevel(id: number, rowVersion: string) { return this.remote.archiveHierarchyLevel(id, rowVersion); }
  restoreHierarchyLevel(id: number, rowVersion: string) { return this.remote.restoreHierarchyLevel(id, rowVersion); }
}
