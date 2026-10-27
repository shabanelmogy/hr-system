/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { EmailTemplate } from '../../domain/email-template';
import { EmailTemplatesScreen } from './EmailTemplatesScreen';

let mockAllowed = true;
const mockRead = jest.fn();
const mockRow: EmailTemplate = { id: 'email-confirmation', nameEn: 'Confirmation', nameAr: 'تأكيد', language: 'en', subject: 'Company subject', body: '<p>Body</p>', isCustomized: true, revision: 4, variables: [] };
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: 'en' } }) }));
jest.mock('@/src/platform/auth', () => ({ useAuth: () => ({ session: { tenantId: 'tenant', companyId: 1, userId: 'user' } }), useAuthorization: () => ({ allowed: mockAllowed }), permissions: { ViewCompanyEmailTemplates: 'CompanyEmailTemplates:View' } }));
jest.mock('@/src/core/theme', () => ({ spacing: { md: 12, sm: 8 }, useAppTheme: () => ({ theme: { colors: { success: 'green', textMuted: 'gray' } } }) }));
jest.mock('../queries/use-email-templates', () => ({ useEmailTemplates: (...args: unknown[]) => {
  mockRead(...args);
  return { list: { data: { items: [mockRow], totalCount: 1 }, isPending: false, isError: false, isFetching: false, refetch: jest.fn() }, preview: { data: { subject: 'Final sample subject', html: '<p>Final sample content</p>', text: 'Final sample content' }, isPending: false, isError: false } };
} }));
jest.mock('@/src/shared/components/preview', () => {
  const Native = require('react-native');
  return { AppHtmlPreview: ({ html }: { html: string }) => <Native.Text>{html}</Native.Text> };
});
jest.mock('@/src/shared/components', () => {
  const Native = require('react-native');
  const Wrapper = ({ children }: { children?: ReactNode }) => <Native.View>{children}</Native.View>;
  const Text = ({ children }: { children?: ReactNode }) => <Native.Text>{children}</Native.Text>;
  return {
    AppScreen: Wrapper, AppDataCard: Wrapper, AppText: Text,
    AppStatusBadge: ({ label }: { label: string }) => <Native.Text>{label}</Native.Text>,
    AppIconButton: ({ label, onPress }: { label: string; onPress: () => void }) => <Native.Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}><Native.Text>{label}</Native.Text></Native.Pressable>,
    AppModal: ({ visible, children }: { visible: boolean; children: ReactNode }) => visible ? <Native.View>{children}</Native.View> : null,
    AppFilterFormButton: () => null, AppSelectField: () => null,
    AppStateView: ({ message }: { message?: string }) => <Native.Text>{message}</Native.Text>,
    AppListScreen: ({ items, views, aboveViews }: { items: EmailTemplate[]; aboveViews: ReactNode; views: { value: string; render: (items: EmailTemplate[]) => ReactNode }[] }) => <Native.View>{aboveViews}{views.map(view => <Native.View key={view.value}>{view.render(items)}</Native.View>)}</Native.View>,
    AppDataTable: ({ rows, columns }: { rows: EmailTemplate[]; columns: { id: string; render: (row: EmailTemplate) => ReactNode }[] }) => <Native.View>{rows.map(row => <Native.View key={row.id}>{columns.map(column => <Native.View key={column.id}>{column.render(row)}</Native.View>)}</Native.View>)}</Native.View>,
  };
});
beforeEach(() => { mockAllowed = true; mockRead.mockClear(); });
it('composes Table/Cards with preview only and opens the effective final email', async () => {
  await render(<EmailTemplatesScreen />);
  expect(screen.getByText('emailTemplates.readOnlyHint')).toBeTruthy();
  expect(screen.getAllByText('Company subject')).toHaveLength(2);
  expect(screen.queryByText('emailTemplates.edit')).toBeNull();
  expect(screen.queryByText('emailTemplates.reset')).toBeNull();
  await fireEvent.press(screen.getAllByRole('button', { name: 'emailTemplates.preview' })[0]);
  expect(screen.getByText('Final sample subject')).toBeTruthy();
  expect(screen.getByText('<p>Final sample content</p>')).toBeTruthy();
  expect(mockRead.mock.lastCall?.[2]).toBe('email-confirmation');
});
it('denies the view and disables both read queries without its permission', async () => {
  mockAllowed = false;
  await render(<EmailTemplatesScreen />);
  expect(screen.getByText('emailTemplates.forbidden')).toBeTruthy();
  expect(screen.queryByText('Company subject')).toBeNull();
  expect(mockRead.mock.lastCall?.[1]).toBe(false);
});
