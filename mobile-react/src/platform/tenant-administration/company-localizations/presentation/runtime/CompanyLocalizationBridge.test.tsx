import { act, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/src/core/localization/i18n';
import { clearCompanyUiResources, getResolvedCompanyUiLanguage, setExplicitCompanyUiLanguage } from '@/src/core/localization/company-ui-resources';
import type { CompanyLocalizationRuntime } from '../../domain/models/company-localization';
import { CompanyLocalizationBridge } from './CompanyLocalizationBridge';

const mockGetRuntime = jest.fn();
let mockCompanyId = 1;
let mockOnline = true;
jest.mock('@/src/core/localization', () => jest.requireActual('@/src/core/localization/company-ui-resources'));
jest.mock('@/src/core/offline', () => ({ useConnectivity: () => ({ isOnline: mockOnline }) }));
jest.mock('@/src/platform/auth', () => ({
  useAuth: () => ({ session: { tenantId: 'demo', companyId: mockCompanyId, userId: 'member', permissions: [] }, isServerAuthenticated: true, isSwitchingCompany: false }),
  permissions: { ViewCompanyLocalizations: 'CompanyLocalizations:View' },
}));
jest.mock('../../composition/use-company-localization-use-cases', () => ({
  useCompanyLocalizationUseCases: () => ({ getRuntime: mockGetRuntime }),
}));
function bundle(companyId: number, value: string): CompanyLocalizationRuntime {
  return { tenantId: 'demo', companyId, defaultLanguage: 'ar', revision: 1, catalogVersion: 'test',
    overrides: [{ namespace: 'translation', language: 'en', key: 'companyLocalizations.title', value }] };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

describe('mobile company localization runtime requests', () => {
  beforeEach(() => {
    mockCompanyId = 1; mockOnline = true; mockGetRuntime.mockReset();
    setExplicitCompanyUiLanguage(null); clearCompanyUiResources();
  });
  afterEach(() => { setExplicitCompanyUiLanguage(null); clearCompanyUiResources(); });

  it('discards a delayed company A request after switching to B and restores shipped texts while offline', async () => {
    const original = i18n.t('companyLocalizations.title', { lng: 'en' });
    const first = deferred<CompanyLocalizationRuntime>();
    mockGetRuntime.mockImplementation(({ companyId }: { companyId: number }) => companyId === 1 ? first.promise : Promise.resolve(bundle(2, 'Company B')));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const view = () => <QueryClientProvider client={client}><CompanyLocalizationBridge /></QueryClientProvider>;
    const rendered = await render(view());
    await waitFor(() => expect(mockGetRuntime).toHaveBeenCalledWith({ tenantId: 'demo', companyId: 1 }));
    await act(() => { mockCompanyId = 2; clearCompanyUiResources(); });
    await rendered.rerender(view());
    await waitFor(() => expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe('Company B'));
    await act(async () => { first.resolve(bundle(1, 'Late company A')); await first.promise; });
    expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe('Company B');
    expect(getResolvedCompanyUiLanguage()).toBe('ar');
    mockOnline = false;
    await rendered.rerender(view());
    await waitFor(() => expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe(original));
    expect(getResolvedCompanyUiLanguage()).toBe('en');
    await rendered.unmount(); client.clear();
  });

  it('returns to the original language and texts when a refreshed runtime request fails', async () => {
    mockGetRuntime.mockResolvedValue(bundle(1, 'Company A'));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const rendered = await render(<QueryClientProvider client={client}><CompanyLocalizationBridge /></QueryClientProvider>);
    await waitFor(() => expect(getResolvedCompanyUiLanguage()).toBe('ar'));
    mockGetRuntime.mockRejectedValue(new Error('Catalog mismatch'));
    await act(async () => { await client.invalidateQueries({ queryKey: ['company-localizations'] }); });
    await waitFor(() => expect(getResolvedCompanyUiLanguage()).toBe('en'), { timeout: 5000 });
    expect(i18n.t('companyLocalizations.title', { lng: 'en' })).not.toBe('Company A');
    await rendered.unmount(); client.clear();
  });
});
