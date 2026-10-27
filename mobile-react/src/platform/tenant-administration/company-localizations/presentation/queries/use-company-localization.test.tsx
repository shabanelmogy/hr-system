import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useCompanyLocalization } from './use-company-localization';

const mockSettings = jest.fn();
const mockTexts = jest.fn();
const mockSetText = jest.fn();
let mockOnline = true;
let mockReadOnly = false;
jest.mock('@/src/core/localization', () => ({ companyUiGeneration: () => 0, subscribeCompanyUiGeneration: () => () => undefined }));
jest.mock('@/src/core/offline', () => ({ useConnectivity: () => ({ isOnline: mockOnline }) }));
jest.mock('@/src/platform/auth', () => ({
  useAuth: () => ({ session: { tenantId: 'tenant', companyId: 2, userId: 'actor', tenantReadOnly: mockReadOnly,
    permissions: ['CompanyLocalizations:View', 'CompanyLocalizations:Edit'] }, isServerAuthenticated: true, isSwitchingCompany: false }),
  permissions: { ViewCompanyLocalizations: 'CompanyLocalizations:View', EditCompanyLocalizations: 'CompanyLocalizations:Edit' },
}));
jest.mock('../../composition/use-company-localization-use-cases', () => ({
  useCompanyLocalizationUseCases: () => ({ getSettings: mockSettings, getTexts: mockTexts, setText: mockSetText }),
}));

describe('company localization list controller', () => {
  beforeEach(() => {
    mockOnline = true; mockReadOnly = false; jest.clearAllMocks();
    mockSettings.mockResolvedValue({ tenantId: 'tenant', companyId: 2, defaultLanguage: 'en', revision: 0,
      sources: [{ id: 'mobile:translation', client: 'mobile', namespace: 'translation' }, { id: 'web:core', client: 'web', namespace: 'core' }] });
    mockTexts.mockResolvedValue({ items: [], totalCount: 100, revision: 0 });
    mockSetText.mockResolvedValue(undefined);
  });
  function setup() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } } });
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return { client, wrapper };
  }
  it('uses server paging and resets the page on a source change, then invalidates the scoped runtime after save', async () => {
    const { client, wrapper } = setup();
    const hook = await renderHook(() => useCompanyLocalization(), { wrapper });
    await waitFor(() => expect(mockTexts).toHaveBeenCalledWith(expect.objectContaining({ source: 'mobile:translation', page: 1, pageSize: 25 })));
    await act(() => hook.result.current.setQuery(previous => ({ ...previous, page: 3 })));
    await waitFor(() => expect(mockTexts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 })));
    await act(() => hook.result.current.setQuery(previous => ({ ...previous, source: 'web:core' })));
    await waitFor(() => expect(mockTexts).toHaveBeenLastCalledWith(expect.objectContaining({ source: 'web:core', page: 1 })));
    mockSettings.mockResolvedValueOnce({ tenantId: 'tenant', companyId: 2, defaultLanguage: 'en', revision: 1,
      sources: [{ id: 'mobile:translation', client: 'mobile', namespace: 'translation' }] });
    await act(async () => { await hook.result.current.settingsQuery.refetch(); });
    await waitFor(() => expect(mockTexts).toHaveBeenLastCalledWith(expect.objectContaining({ source: 'mobile:translation' })));
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const request = { source: 'web:core', language: 'en' as const, key: 'title', value: 'New', expectedRevision: 0 };
    await act(async () => { await hook.result.current.setText.mutateAsync(request); });
    expect(mockSetText).toHaveBeenCalledWith(request);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['company-localizations', 'tenant', 2, 'actor'] });
    await hook.unmount(); client.clear();
  });
  it.each(['offline', 'read-only'])('blocks a direct mutation callback while %s', async mode => {
    mockOnline = mode !== 'offline'; mockReadOnly = mode === 'read-only';
    const { client, wrapper } = setup();
    const hook = await renderHook(() => useCompanyLocalization(), { wrapper });
    await expect(hook.result.current.setText.mutateAsync({ source: 'web:core', language: 'en', key: 'title', value: 'New', expectedRevision: 0 })).rejects.toThrow();
    expect(mockSetText).not.toHaveBeenCalled();
    await hook.unmount(); client.clear();
  });
  it('does not fetch texts with a stale selected source before current settings resolve', async () => {
    let resolveSettings: ((settings: { tenantId: string; companyId: number; defaultLanguage: string; revision: number; sources: { id: string; client: string; namespace: string }[] }) => void) | undefined;
    mockSettings.mockImplementationOnce(() => new Promise((resolve) => { resolveSettings = resolve; }));
    const { client, wrapper } = setup();
    const hook = await renderHook(() => useCompanyLocalization(), { wrapper });
    await act(() => hook.result.current.setQuery(previous => ({ ...previous, source: 'removed:source' })));
    expect(mockTexts).not.toHaveBeenCalled();
    await act(async () => { resolveSettings?.({ tenantId: 'tenant', companyId: 2, defaultLanguage: 'en', revision: 0, sources: [{ id: 'mobile:translation', client: 'mobile', namespace: 'translation' }] }); });
    await waitFor(() => expect(mockTexts).toHaveBeenCalledWith(expect.objectContaining({ source: 'mobile:translation' })));
    await hook.unmount(); client.clear();
  });
});
