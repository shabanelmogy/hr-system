import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type AppIconName = ComponentProps<typeof Ionicons>['name'];

export type AppIconProps = ComponentProps<typeof Ionicons>;

export function AppIcon(props: AppIconProps) {
  return <Ionicons {...props} />;
}
