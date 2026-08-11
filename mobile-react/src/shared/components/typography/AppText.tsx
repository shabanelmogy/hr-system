import type { PropsWithChildren } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';

export type AppTextVariant =
  | 'caption'
  | 'bodySmall'
  | 'body'
  | 'label'
  | 'titleSmall'
  | 'title'
  | 'display';

type AppTextColor = 'default' | 'muted' | 'primary' | 'secondary' | 'danger' | 'success';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: AppTextColor;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
}

const variantStyles: Record<AppTextVariant, TextStyle> = {
  caption: { fontSize: 12, lineHeight: 16 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  titleSmall: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 31, fontWeight: '700' },
  display: { fontSize: 30, lineHeight: 38, fontWeight: '800' },
};

export function AppText({
  children,
  variant = 'body',
  color = 'default',
  align,
  weight,
  style,
  ...props
}: PropsWithChildren<AppTextProps>) {
  const { theme } = useAppTheme();
  const { isRTL } = useLocalization();

  const colorMap: Record<AppTextColor, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    danger: theme.colors.danger,
    success: theme.colors.success,
  };

  return (
    <Text
      {...props}
      style={[
        variantStyles[variant],
        {
          color: colorMap[color],
          textAlign: align ?? (isRTL ? 'right' : 'left'),
          writingDirection: isRTL ? 'rtl' : 'ltr',
          fontWeight: weight,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}
