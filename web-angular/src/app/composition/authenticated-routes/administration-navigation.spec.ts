import type { NavigationEntry } from '../../shared/ui/public-api';
import { groupAdministrationNavigation } from './administration-navigation';

describe('Administration navigation ownership', () => {
  const entry = (id: string): NavigationEntry => ({ id, label: id, icon: 'settings' });
  it('groups operational viewers and Settings under one translated Administration parent', () => {
    const tenants = entry('tenants');
    const audit = entry('system-audit');
    const logs = { ...entry('system-error-logs'), selected: true };
    const navigation = groupAdministrationNavigation([logs, audit, tenants], 'الإدارة');
    expect(navigation).toEqual([
      tenants,
      {
        id: 'system-administration',
        label: 'الإدارة',
        icon: 'admin',
        children: [audit, logs],
      },
    ]);
  });
  it('keeps independent permissions and never creates an empty parent or unavailable workflow', () => {
    const tenants = entry('tenants');
    expect(groupAdministrationNavigation([tenants], 'Administration')).toEqual([tenants]);
    expect(groupAdministrationNavigation([entry('error-log-settings')], 'Administration')).toEqual([
      entry('error-log-settings'),
    ]);
  });
  it('keeps Global Report Manager at its requested standalone position', () => {
    const manager = entry('global-template-manager');
    const tenants = entry('tenants');
    expect(groupAdministrationNavigation([manager, tenants], 'Administration')).toEqual([
      manager,
      tenants,
    ]);
  });
  it('includes Health, API Docs and Background Jobs exactly once', () => {
    const tools = ['system-health', 'system-api-docs', 'hangfire-dashboard'].map(entry);
    const result = groupAdministrationNavigation(tools, 'Administration');
    expect(result).toHaveLength(1);
    expect(result[0]?.children?.map((child) => child.id)).toEqual(tools.map((tool) => tool.id));
  });
});
