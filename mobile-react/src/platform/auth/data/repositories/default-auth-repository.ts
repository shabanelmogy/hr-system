import type { AuthRepository } from '../../domain/repositories/auth-repository';

export class DefaultAuthRepository implements AuthRepository {
  constructor(private readonly remote: AuthRepository) {}

  register(request: Parameters<AuthRepository['register']>[0]) { return this.remote.register(request); }
  forgetPassword(email: string) { return this.remote.forgetPassword(email); }
  resetPassword(request: Parameters<AuthRepository['resetPassword']>[0]) { return this.remote.resetPassword(request); }
  confirmEmail(request: Parameters<AuthRepository['confirmEmail']>[0]) { return this.remote.confirmEmail(request); }
  acceptInvitation(request: Parameters<AuthRepository['acceptInvitation']>[0]) { return this.remote.acceptInvitation(request); }
  resendConfirmationEmail(email: string) { return this.remote.resendConfirmationEmail(email); }
  login(request: Parameters<AuthRepository['login']>[0]) { return this.remote.login(request); }
  selectTenant(token: string, tenantId: string) { return this.remote.selectTenant(token, tenantId); }
  selectCompany(token: string, companyId: number) { return this.remote.selectCompany(token, companyId); }
  switchCompany(companyId: number) { return this.remote.switchCompany(companyId); }
  session() { return this.remote.session(); }
  getUserPhoto() { return this.remote.getUserPhoto(); }
  logout() { return this.remote.logout(); }
  refreshSession() { return this.remote.refreshSession(); }
}
