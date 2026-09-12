import { View } from 'react-native';

import { AppAppBar, type AppAppBarProps } from './AppAppBar';
import { AppBreadcrumbs } from './AppBreadcrumbs';

type AppNavigationHeaderProps = AppAppBarProps;

export function AppNavigationHeader(props: AppNavigationHeaderProps) {
  return (
    <View>
      <AppAppBar {...props} />
      <AppBreadcrumbs />
    </View>
  );
}
