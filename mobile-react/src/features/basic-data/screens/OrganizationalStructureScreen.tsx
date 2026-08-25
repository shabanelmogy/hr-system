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
          label: t('companyGeographicScope.title'),
          icon: 'earth-outline',
          permissions: [permissions.ViewCompanyGeographicScope],
          route: ROUTES.basicData.companyGeographicScope,
        },
        { label: t('basicData.companies'), icon: 'business-outline' },
        { label: t('basicData.branches'), icon: 'git-branch-outline' },
        { label: t('basicData.departments'), icon: 'people-circle-outline' },
        { label: t('basicData.jobs'), icon: 'briefcase-outline' },
      ]}
      title={t('navigation.organizationalStructure')}
    />
  );
}
