import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface State {
  failed: boolean;
  retryKey: number;
}

// This boundary intentionally runs before localization/theme providers exist.
// Keep the fallback bilingual and dependency-free so provider failures remain recoverable.
const BOOTSTRAP_COPY = {
  title: 'تعذر بدء التطبيق · Unable to start the application',
  message: 'تعذر فتح التخزين المحلي بأمان. أعد المحاولة دون حذف بيانات التطبيق.\nLocal storage could not be opened safely. Retry without clearing app data.',
  retry: 'إعادة المحاولة · Retry',
} as const;

export class BootstrapErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { failed: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application bootstrap failed.', error, info.componentStack);
  }

  private readonly retry = () => {
    this.setState(({ retryKey }) => ({ failed: false, retryKey: retryKey + 1 }));
  };

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <View accessibilityRole="alert" style={styles.root}>
          <Text style={styles.title}>{BOOTSTRAP_COPY.title}</Text>
          <Text style={styles.message}>{BOOTSTRAP_COPY.message}</Text>
          <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
            <Text style={styles.buttonText}>{BOOTSTRAP_COPY.retry}</Text>
          </Pressable>
        </View>
      );
    }

    return <View key={this.state.retryKey} style={styles.content}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, backgroundColor: '#ffffff' },
  content: { flex: 1 },
  title: { color: '#172033', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { color: '#4b5565', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  button: { minHeight: 48, minWidth: 180, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#2457d6', paddingHorizontal: 20 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
