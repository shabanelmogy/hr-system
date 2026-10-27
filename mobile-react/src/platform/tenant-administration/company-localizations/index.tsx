import { useAuth } from '@/src/platform/auth';
import { CompanyLocalizationsScreen as CompanyLocalizationsContent } from './presentation/screens/CompanyLocalizationsScreen';

export { CompanyLocalizationBridge } from './presentation/runtime/CompanyLocalizationBridge';
export function CompanyLocalizationsScreen() {
  const { session } = useAuth();
  return <CompanyLocalizationsContent key={`${session?.tenantId}:${session?.companyId}:${session?.userId}`} />;
}

export function SystemLocalizationsScreen(){const {session}=useAuth();return <CompanyLocalizationsContent system key={`system:${session?.userId}:${[...(session?.permissions??[])].sort().join('|')}`}/>;}
