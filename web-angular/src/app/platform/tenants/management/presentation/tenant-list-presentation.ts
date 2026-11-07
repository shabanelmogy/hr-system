import type { CollectionColumn, GridRowAction } from '../../../../shared/ui/public-api';
import type { TenantRecord } from '../types/tenant';

export function tenantColumns(
  text: (key: string) => string,
  date: (value: string) => string,
): readonly CollectionColumn<TenantRecord>[] {
  return [
    {
      key: 'identifier',
      header: text('tenantManagement.identifier'),
      value: (row) => row.identifier,
      sortField: 'identifier',
      minWidth: 140,
      flex: 1,
    },
    {
      key: 'name',
      header: text('tenantManagement.name'),
      value: (row) => row.name,
      sortField: 'name',
      minWidth: 180,
      flex: 1.3,
    },
    {
      key: 'planName',
      header: text('tenantManagement.plan'),
      value: (row) => row.planName || text('tenantManagement.noPlan'),
      minWidth: 120,
      flex: 0.9,
    },
    {
      key: 'subscriptionStatus',
      header: text('tenantManagement.status'),
      value: (row) => text('tenantManagement.statuses.' + row.subscriptionStatus),
      minWidth: 135,
      align: 'center',
      flex: 1,
    },
    {
      key: 'adminCount',
      header: text('tenantManagement.admins'),
      value: (row) => `${row.adminCount}/${row.maxAdmins}`,
      minWidth: 105,
      align: 'center',
      flex: 0.8,
    },
    {
      key: 'userCount',
      header: text('tenantManagement.users'),
      value: (row) => `${row.userCount}/${row.maxUsers}`,
      minWidth: 105,
      align: 'center',
      flex: 0.8,
    },
    {
      key: 'companyCount',
      header: text('tenantManagement.companies'),
      value: (row) => row.companyCount,
      minWidth: 105,
      align: 'center',
      flex: 0.8,
    },
    {
      key: 'isActive',
      header: text('tenantManagement.accessStatus'),
      value: (row) => text('tenantManagement.' + (row.isActive ? 'enabled' : 'disabled')),
      minWidth: 115,
      align: 'center',
      flex: 0.8,
    },
    {
      key: 'createdOn',
      header: text('general.createdOn'),
      value: (row) => date(row.createdOn),
      sortField: 'createdOn',
      minWidth: 145,
      flex: 1,
    },
  ];
}

export function tenantRowActions(allowed: boolean, label: string): readonly GridRowAction[] {
  return allowed ? [{ id: 'edit', label, icon: 'edit' }] : [];
}
