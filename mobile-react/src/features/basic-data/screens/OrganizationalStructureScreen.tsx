import { useTranslation } from 'react-i18next';

import { ReferenceSectionScreen } from '@/src/features/basic-data/screens/ReferenceSectionScreen';
import { ROUTES } from '@/src/core/constants/routes';
import { permissions } from '@/src/features/auth';

export function OrganizationalStructureScreen() {
  const { t } = useTranslation();

  return (
    <ReferenceSectionScreen
      description={t('basicData.organizationDescription')}
      items={[
        {
          label: t('organizationalStructure.resources.branches'),
          icon: 'business-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureBranches,
        },
        {
          label: t('organizationalStructure.resources.departments'),
          icon: 'git-branch-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureDepartments,
        },
        {
          label: t('organizationalStructure.resources.divisions'),
          icon: 'git-branch-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureDivisions,
        },
        {
          label: t('organizationalStructure.resources.job-titles'),
          icon: 'briefcase-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureJobTitles,
        },
        {
          label: t('organizationalStructure.resources.job-levels'),
          icon: 'layers-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureJobLevels,
        },
        {
          label: t('organizationalStructure.resources.positions'),
          icon: 'briefcase-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructurePositions,
        },
        {
          label: t('organizationalStructure.resources.job-descriptions'),
          icon: 'document-text-outline',
          permissions: [permissions.ViewOrganizationalStructure],
          route: ROUTES.basicData.organizationalStructureJobDescriptions,
        },
        {
          label: t('companyGeographicScope.title'),
          icon: 'earth-outline',
          permissions: [permissions.ViewCompanyGeographicScope],
          route: ROUTES.basicData.companyGeographicScope,
        },
      ]}
      title={t('navigation.organizationalStructure')}
    />
  );
}
