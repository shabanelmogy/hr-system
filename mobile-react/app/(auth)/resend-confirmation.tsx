import { Redirect } from 'expo-router';

import { ROUTES } from '@/src/core/constants/routes';
import { ENV } from '@/src/core/config/env';
import { ResendConfirmationScreen } from '@/src/features/auth';

export default function ResendConfirmationRoute() {
  if (!ENV.publicSelfRegistrationEnabled) {
    return <Redirect href={ROUTES.login} />;
  }

  return <ResendConfirmationScreen />;
}
