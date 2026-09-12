import type { AdministrationRepository } from '../../domain/repositories/administration-repository';
import type { AdministrationRemoteDataSource } from '../remote/administration-remote-data-source';

export class DefaultAdministrationRepository implements AdministrationRepository {
  constructor(
    private readonly remote: AdministrationRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Administration requires an internet connection.');
  }

  getUsersPage(query: Parameters<AdministrationRepository['getUsersPage']>[0]) { this.requireOnline(); return this.remote.getUsersPage(query); }
  getUsers() { this.requireOnline(); return this.remote.getUsers(); }
  createUser(request: Parameters<AdministrationRepository['createUser']>[0]) { this.requireOnline(); return this.remote.createUser(request); }
  getCompanyOptions() { this.requireOnline(); return this.remote.getCompanyOptions(); }
  getRoles() { this.requireOnline(); return this.remote.getRoles(); }
  createRole(request: Parameters<AdministrationRepository['createRole']>[0]) { this.requireOnline(); return this.remote.createRole(request); }
  updateRole(request: Parameters<AdministrationRepository['updateRole']>[0]) { this.requireOnline(); return this.remote.updateRole(request); }
  toggleRole(id: string) { this.requireOnline(); return this.remote.toggleRole(id); }
  getRoleClaims(id: string) { this.requireOnline(); return this.remote.getRoleClaims(id); }
  updateRoleClaims(request: Parameters<AdministrationRepository['updateRoleClaims']>[0]) { this.requireOnline(); return this.remote.updateRoleClaims(request); }
  getInvitations() { this.requireOnline(); return this.remote.getInvitations(); }
  createInvitation(request: Parameters<AdministrationRepository['createInvitation']>[0]) { this.requireOnline(); return this.remote.createInvitation(request); }
  resendInvitation(id: string) { this.requireOnline(); return this.remote.resendInvitation(id); }
  revokeInvitation(id: string) { this.requireOnline(); return this.remote.revokeInvitation(id); }
  updateUser(id: string, request: Parameters<AdministrationRepository['updateUser']>[1]) { this.requireOnline(); return this.remote.updateUser(id, request); }
  changeUserPassword(id: string, request: Parameters<AdministrationRepository['changeUserPassword']>[1]) { this.requireOnline(); return this.remote.changeUserPassword(id, request); }
  toggleUser(id: string) { this.requireOnline(); return this.remote.toggleUser(id); }
  unlockUser(id: string) { this.requireOnline(); return this.remote.unlockUser(id); }
  archiveUser(id: string, reason: string) { this.requireOnline(); return this.remote.archiveUser(id, reason); }
  restoreUser(id: string) { this.requireOnline(); return this.remote.restoreUser(id); }
  revokeUserSessions(userId: string) { this.requireOnline(); return this.remote.revokeUserSessions(userId); }
}
