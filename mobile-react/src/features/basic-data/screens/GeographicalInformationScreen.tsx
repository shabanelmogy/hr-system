import { useTranslation } from 'react-i18next';

import { appRoles, permissions } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { ReferenceSectionScreen } from '@/src/features/basic-data/screens/ReferenceSectionScreen';

export function GeographicalInformationScreen() {
  const { t } = useTranslation();

  return (
    <ReferenceSectionScreen
      description={t('basicData.geographicalDescription')}
      items={[
        {
          label: t('basicData.countries'),
          icon: 'flag-outline',
          roles: [appRoles.superAdmin],
          route: ROUTES.basicData.countries,
        },
        {
          label: t('basicData.states'),
          icon: 'map-outline',
          roles: [appRoles.superAdmin],
          route: ROUTES.basicData.states,
        },
        {
          label: t('basicData.districts'),
          icon: 'location-outline',
          roles: [appRoles.superAdmin],
          route: ROUTES.basicData.districts,
        },
        {
          label: t('basicData.addressTypes'),
          icon: 'home-outline',
          permissions: [permissions.ViewAddressTypes],
          route: ROUTES.basicData.addressTypes,
        },
      ]}
      title={t('navigation.globalGeography')}
    />
  );
}
