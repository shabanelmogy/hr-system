import { Redirect } from 'expo-router';

import { ROUTES } from '@/src/core/constants/routes';
import { ENV } from '@/src/core/config/env';
import { Register } from '@/src/features/auth/register/Register';

export default function RegisterRoute() {
  if (!ENV.publicSelfRegistrationEnabled) {
    return <Redirect href={ROUTES.login} />;
  }

  return <Register />;
}
