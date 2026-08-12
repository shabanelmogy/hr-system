import {
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { AppText } from '@/src/shared/components/typography/AppText';

interface AppFieldMessageProps {
  children: string;
  error?: boolean;
  style?: StyleProp<TextStyle>;
}

export function AppFieldMessage({ children, error = false, style }: AppFieldMessageProps) {
  const { isRTL } = useLocalization();

  return (
    <View
      style={[
        styles.container,
        {
          alignItems: isRTL ? 'flex-end' : 'flex-start',
        },
      ]}>
      <AppText
        align={isRTL ? 'right' : 'left'}
        color={error ? 'danger' : 'muted'}
        style={[
          styles.message,
          {
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
          style,
        ]}
        variant="caption">
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
    paddingHorizontal: 12,
  },
  message: {
    maxWidth: '100%',
  },
});
