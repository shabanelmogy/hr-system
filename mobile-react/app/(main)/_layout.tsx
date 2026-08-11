import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '@/src/layouts/main/MainLayout';

export default function ProtectedRouteLayout() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="basic-data" />
        <Stack.Screen
          name="modal"
          options={{
            headerShown: true,
            presentation: 'modal',
            title: t('modal.title'),
          }}
        />
      </Stack>
    </MainLayout>
  );
}
