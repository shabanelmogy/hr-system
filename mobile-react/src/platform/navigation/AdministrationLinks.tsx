import { administrationLauncherEntries } from '@/src/platform/modules/registry';
import { PlatformNavigationLinks } from './PlatformNavigationLinks';

export const administrationLinks = administrationLauncherEntries;

export function AdministrationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <PlatformNavigationLinks titleKey="navigation.administration" links={administrationLinks} onNavigate={onNavigate} />;
}
