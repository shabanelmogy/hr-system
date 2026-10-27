import { createEmailTemplateUseCases } from '../../application/email-template-use-cases';
import { OnlineEmailTemplateReader } from './online-email-template-reader';
describe('email template preview capabilities', () => {
  it('has no create/edit/reset/send use case', async () => {
    const remote = { list: jest.fn().mockResolvedValue({ items: [] }), preview: jest.fn().mockResolvedValue({ subject: 'Sample' }) };
    const cases = createEmailTemplateUseCases(new OnlineEmailTemplateReader(remote, () => true));
    expect(Object.keys(cases).sort()).toEqual(['list', 'preview']);
    await cases.preview('user-invitation', 'ar');
    expect(remote.preview).toHaveBeenCalledWith('user-invitation', 'ar');
  });
  it('never replays or fetches templates while offline', () => {
    const remote = { list: jest.fn(), preview: jest.fn() };
    const cases = createEmailTemplateUseCases(new OnlineEmailTemplateReader(remote, () => false));
    expect(() => cases.preview('user-invitation', 'en')).toThrow();
    expect(remote.preview).not.toHaveBeenCalled();
  });
});
