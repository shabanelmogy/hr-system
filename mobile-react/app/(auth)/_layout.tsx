import { Stack } from 'expo-router';

import { AuthLayout } from '@/src/shell/layouts';

export default function AuthRouteLayout() {
  return (
    <AuthLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthLayout>
  );
}
