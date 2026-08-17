import { View } from 'react-native';

import { AppAppBar } from '@/src/layouts/AppAppBar';
import { AppBreadcrumbs } from '@/src/layouts/navigation/AppBreadcrumbs';

interface AppNavigationHeaderProps {
  showDrawer?: boolean;
  showLogout?: boolean;
  onDrawerPress?: () => void;
}

export function AppNavigationHeader(props: AppNavigationHeaderProps) {
  return (
    <View>
      <AppAppBar {...props} />
      <AppBreadcrumbs />
    </View>
  );
}
