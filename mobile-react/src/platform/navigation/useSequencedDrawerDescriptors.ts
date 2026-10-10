import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { useMemo } from 'react';

import { getModuleSequenceAccent, type ModuleAccentKey, useAppTheme } from '@/src/core/theme';

/**
 * Drawer descriptors whose inactive item icons alternate through the palette's module
 * colors, starting after `moduleKey`'s own color, so neighbours never share a color (same
 * rule as the web sidebar). The focused item keeps the drawer's active tint; hidden items
 * (`drawerItemStyle.display: 'none'`) are skipped so the visible sequence stays alternating.
 */
export function useSequencedDrawerDescriptors(
  { descriptors, state }: Pick<DrawerContentComponentProps, 'descriptors' | 'state'>,
  moduleKey?: ModuleAccentKey,
): DrawerContentComponentProps['descriptors'] {
  const { theme } = useAppTheme();

  return useMemo(() => {
    let visibleIndex = 0;
    const next: DrawerContentComponentProps['descriptors'] = { ...descriptors };
    for (const route of state.routes) {
      const descriptor = descriptors[route.key];
      if (!descriptor) continue;
      const itemStyle = descriptor.options.drawerItemStyle as { display?: string } | undefined;
      const renderIcon = descriptor.options.drawerIcon;
      if (itemStyle?.display === 'none' || !renderIcon) continue;
      const accent = getModuleSequenceAccent(theme, moduleKey, visibleIndex);
      visibleIndex += 1;
      next[route.key] = {
        ...descriptor,
        options: {
          ...descriptor.options,
          drawerIcon: (props) => renderIcon({ ...props, color: props.focused ? props.color : accent }),
        },
      };
    }
    return next;
  }, [descriptors, moduleKey, state.routes, theme]);
}
