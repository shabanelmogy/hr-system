import { Stack } from 'expo-router';

import { AuthLayout } from '@/src/layouts/auth/AuthLayout';

export default function AuthRouteLayout() {
  return (
    <AuthLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthLayout>
  );
}
