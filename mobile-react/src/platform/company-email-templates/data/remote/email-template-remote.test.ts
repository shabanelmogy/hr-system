import { apiService } from '@/src/core/api';
import { emailTemplateRemote } from './email-template-remote';
jest.mock('@/src/core/api', () => ({ apiService: { get: jest.fn(), post: jest.fn() } }));
describe('company email template read contracts', () => {
  beforeEach(() => jest.clearAllMocks());
  it('passes bounded criteria without accepting a client company ID and validates the catalog', async () => {
    jest.mocked(apiService.get).mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 10, revision: 2 });
    const criteria = { language: 'ar' as const, search: 'name', status: 'all' as const, page: 1, pageSize: 10 };
    expect((await emailTemplateRemote.list(criteria)).revision).toBe(2);
    expect(apiService.get).toHaveBeenCalledWith('company-email-templates', { params: criteria });
    jest.mocked(apiService.get).mockResolvedValue({ items: 'invalid' });
    await expect(emailTemplateRemote.list(criteria)).rejects.toThrow();
  });
  it('previews samples with only the template and language, never recipient or draft mutations', async () => {
    jest.mocked(apiService.post).mockResolvedValue({ subject: 'Sample', html: '<p>Sample</p>', text: 'Sample' });
    expect((await emailTemplateRemote.preview('password-reset', 'en')).subject).toBe('Sample');
    expect(apiService.post).toHaveBeenCalledWith('company-email-templates/password-reset/preview', { language: 'en' });
    expect(Object.keys(emailTemplateRemote).sort()).toEqual(['list', 'preview']);
  });
});
