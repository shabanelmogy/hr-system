import { useTranslation } from 'react-i18next';

import { permissions } from '@/src/features/auth';
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
          permissions: [permissions.ViewCountries],
        },
        {
          label: t('basicData.states'),
          icon: 'map-outline',
          permissions: [permissions.ViewStates],
        },
        {
          label: t('basicData.districts'),
          icon: 'location-outline',
          permissions: [permissions.ViewDistricts],
        },
        {
          label: t('basicData.addressTypes'),
          icon: 'home-outline',
          permissions: [permissions.ViewAddressTypes],
        },
      ]}
      title={t('navigation.geographicalInformation')}
    />
  );
}
