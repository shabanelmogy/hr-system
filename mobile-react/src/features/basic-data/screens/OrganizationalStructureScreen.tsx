import { useTranslation } from 'react-i18next';

import { ReferenceSectionScreen } from '@/src/features/basic-data/screens/ReferenceSectionScreen';

export function OrganizationalStructureScreen() {
  const { t } = useTranslation();

  return (
    <ReferenceSectionScreen
      description={t('basicData.organizationDescription')}
      items={[
        { label: t('basicData.companies'), icon: 'business-outline' },
        { label: t('basicData.branches'), icon: 'git-branch-outline' },
        { label: t('basicData.departments'), icon: 'people-circle-outline' },
        { label: t('basicData.jobs'), icon: 'briefcase-outline' },
      ]}
      title={t('navigation.organizationalStructure')}
    />
  );
}
