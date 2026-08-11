import { useTranslation } from 'react-i18next';

import { ReferenceSectionScreen } from '@/src/features/basic-data/screens/ReferenceSectionScreen';

export function GeographicalInformationScreen() {
  const { t } = useTranslation();

  return (
    <ReferenceSectionScreen
      description={t('basicData.geographicalDescription')}
      items={[
        { label: t('basicData.countries'), icon: 'flag-outline' },
        { label: t('basicData.states'), icon: 'map-outline' },
        { label: t('basicData.districts'), icon: 'location-outline' },
        { label: t('basicData.addressTypes'), icon: 'home-outline' },
      ]}
      title={t('navigation.geographicalInformation')}
    />
  );
}
