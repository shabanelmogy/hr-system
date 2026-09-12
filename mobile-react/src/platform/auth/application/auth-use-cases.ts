import type { AuthRepository } from '../domain/repositories/auth-repository';

export type AuthUseCases = AuthRepository;

export function createAuthUseCases(repository: AuthRepository): AuthUseCases {
  return {
    register: (request) => repository.register(request),
    forgetPassword: (email) => repository.forgetPassword(email),
    resetPassword: (request) => repository.resetPassword(request),
    confirmEmail: (request) => repository.confirmEmail(request),
    acceptInvitation: (request) => repository.acceptInvitation(request),
    resendConfirmationEmail: (email) => repository.resendConfirmationEmail(email),
    login: (request) => repository.login(request),
    selectTenant: (token, tenantId) => repository.selectTenant(token, tenantId),
    selectCompany: (token, companyId) => repository.selectCompany(token, companyId),
    switchCompany: (companyId) => repository.switchCompany(companyId),
    session: () => repository.session(),
    getUserPhoto: () => repository.getUserPhoto(),
    logout: () => repository.logout(),
    refreshSession: () => repository.refreshSession(),
  };
}
