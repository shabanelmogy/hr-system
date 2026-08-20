import { View } from 'react-native';

import { AppAppBar, type AppAppBarProps } from '@/src/layouts/AppAppBar';
import { AppBreadcrumbs } from '@/src/layouts/navigation/AppBreadcrumbs';

type AppNavigationHeaderProps = AppAppBarProps;

export function AppNavigationHeader(props: AppNavigationHeaderProps) {
  return (
    <View>
      <AppAppBar {...props} />
      <AppBreadcrumbs />
    </View>
  );
}
