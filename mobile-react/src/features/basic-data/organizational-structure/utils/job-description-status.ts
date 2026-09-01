import type { OrganizationalStructureItem } from '../types/organizational-structure';

export type JobDescriptionStatusKey = 'draft' | 'approved' | 'rejected' | 'expired';

export function getJobDescriptionStatusKey(item: OrganizationalStructureItem): JobDescriptionStatusKey | null {
  if (typeof item.jobDescriptionStatus === 'number') {
    return ({ 1: 'draft', 2: 'approved', 3: 'rejected', 4: 'expired' } as Record<number, JobDescriptionStatusKey>)[item.jobDescriptionStatus] ?? null;
  }
  const value = item.jobDescriptionStatus?.toLowerCase();
  return value === 'draft' || value === 'approved' || value === 'rejected' || value === 'expired' ? value : null;
}

export const canDecideJobDescription = (item: OrganizationalStructureItem) =>
  !item.isDeleted && getJobDescriptionStatusKey(item) === 'draft';
