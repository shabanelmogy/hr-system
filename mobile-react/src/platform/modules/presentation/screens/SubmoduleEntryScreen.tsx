import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { asHref, type AppRoute } from '@/src/core/constants/routes';
import { AppScreen, AppStateView } from '@/src/shared/components';
import { getMobileSubmoduleDefinition } from '../../registry';
import { useAccessibleModules } from '../queries/use-modules';

export function SubmoduleEntryScreen({
  moduleCode,
  submoduleCode,
  canAccess,
}: {
  moduleCode: string;
  submoduleCode: string;
  canAccess: (path: AppRoute) => boolean;
}) {
  const { t } = useTranslation();
  const modulesQuery = useAccessibleModules();
  const module = modulesQuery.data?.find(
    item => item.code.toLowerCase() === moduleCode.toLowerCase(),
  );
  const submodule = module?.submodules.find(
    item => item.code.toLowerCase() === submoduleCode.toLowerCase(),
  );
  const mobileDefinition = getMobileSubmoduleDefinition(moduleCode, submoduleCode);
  const destination = useMemo(
    () => submodule
      ? mobileDefinition?.entryCandidates.find(canAccess)
      : undefined,
    [canAccess, mobileDefinition, submodule],
  );

  useEffect(() => {
    if (destination) router.replace(asHref(destination));
  }, [destination]);

  if (modulesQuery.isLoading || destination) {
    return <AppScreen><AppStateView state="loading" /></AppScreen>;
  }
  if (modulesQuery.isError) {
    return (
      <AppScreen>
        <AppStateView
          state="error"
          title={t('modules.error')}
          onRetry={() => void modulesQuery.refetch()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppStateView
        state="empty"
        title={submodule
          ? t(`modules.submodules.${module?.code}.${submodule.code}`, {
              defaultValue: submodule.name,
            })
          : t('modules.genericEmpty')}
        message={submodule ? t('modules.noAvailableFeatures') : undefined}
      />
    </AppScreen>
  );
}