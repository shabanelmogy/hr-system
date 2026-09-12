import { createAuthUseCases } from './auth-use-cases';
import type { AuthRepository } from '../domain/repositories/auth-repository';

describe('auth application boundary', () => {
  it('passes company selection tokens and ids through unchanged', async () => {
    const selectCompany = jest.fn().mockResolvedValue({ companyId: 17 });
    const useCases = createAuthUseCases({ selectCompany } as unknown as AuthRepository);

    await useCases.selectCompany('selection-token', 17);

    expect(selectCompany).toHaveBeenCalledWith('selection-token', 17);
  });

  it('does not swallow logout failures before the provider performs local cleanup', async () => {
    const failure = new Error('server unavailable');
    const logout = jest.fn().mockRejectedValue(failure);
    const useCases = createAuthUseCases({ logout } as unknown as AuthRepository);

    await expect(useCases.logout()).rejects.toBe(failure);
  });
});
