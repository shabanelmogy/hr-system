import type { ModuleColorKey } from '@app/tokens';
import type { AppIconName } from '../../../shared/ui/public-api';
import type { AccessibleModule } from '../types/module-contracts';

type Area = { code: string; icon: AppIconName; tone: 'primary'|'secondary'|'info'|'success'|'warning' };
type Definition = { code: string; color: ModuleColorKey; icon: AppIconName; areas: readonly Area[] };
// Presentation only. Server catalog membership remains authoritative; no business route is granted here.
export const moduleDefinitions: readonly Definition[] = [
  { code: 'reference-data', color: 'referenceData', icon: 'globe', areas: [{ code:'addresses',icon:'category',tone:'info' }] },
  { code: 'hr', color: 'hr', icon: 'groups', areas: [
    { code:'basic-data',icon:'dataset',tone:'info' }, { code:'recruitment',icon:'personSearch',tone:'secondary' },
    { code:'workforce',icon:'badge',tone:'primary' }, { code:'attendance',icon:'fingerprint',tone:'warning' },
  ] },
  { code: 'acc', color: 'accounting', icon: 'finance', areas: [{ code:'ledger-setup',icon:'paid',tone:'success' }] },
  { code: 'crm', color: 'crm', icon: 'handshake', areas: [{ code:'appointments',icon:'eventNote',tone:'secondary' }] },
  { code: 'reporting', color: 'reporting', icon: 'chart', areas: [{ code:'analytics',icon:'assessment',tone:'info' }] },
];
export function knownModules(serverModules: readonly AccessibleModule[]): readonly AccessibleModule[] {
  return serverModules.flatMap(module => {
    const definition = moduleDefinitions.find(d => d.code === module.code);
    if (!definition) return [];
    const submodules = module.submodules.filter(a => definition.areas.some(item => item.code === a.code));
    return submodules.length ? [{ ...module, submodules }] : [];
  });
}
export const modulePath = (code: string) => '/apps/' + encodeURIComponent(code);
export const areaPath = (code: string, area: string) => modulePath(code) + '/' + encodeURIComponent(area);
