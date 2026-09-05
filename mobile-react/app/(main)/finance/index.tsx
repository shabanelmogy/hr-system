import { Redirect } from 'expo-router';
import { asHref, ROUTES } from '@/src/core/constants/routes';

export default function FinanceIndex() {
  return <Redirect href={asHref(ROUTES.finance.fiscalYears)} />;
}
