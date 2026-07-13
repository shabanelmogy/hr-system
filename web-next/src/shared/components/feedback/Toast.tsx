import React from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { useTheme, alpha } from '@mui/material/styles';

// Toast configuration
const defaultToastOptions: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    maxWidth: '400px',
  },
};

// Helpers to detect mode for non-React calls
const getMode = (): 'dark' | 'light' => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('currentMode') : null;
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getWarningStyle = (mode: 'dark' | 'light') => ({
  background: mode === 'dark' ? '#78350f' : '#f59e0b', // amber variants
  color: '#fff',
  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
});

const getInfoStyle = (mode: 'dark' | 'light') => ({
  background: mode === 'dark' ? '#1e3a8a' : '#2563eb', // blue variants
  color: '#fff',
  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
});

// Success toast options
const successOptions: ToastOptions = {
  ...defaultToastOptions,
};

// Error toast options
const errorOptions: ToastOptions = {
  ...defaultToastOptions,
};

// Warning toast options

// Info toast options

// Loading toast options
const loadingOptions: ToastOptions = {
  ...defaultToastOptions,
  duration: Infinity, // Loading toasts don't auto-dismiss
};

// Toast utility functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => 
    toast.success(message, { ...successOptions, ...options }),
  
  error: (message: string, options?: ToastOptions) => 
    toast.error(message, { ...errorOptions, ...options }),
  
  warning: (message: string, options?: ToastOptions) => {
    const mode = getMode();
    return toast(message, {
      ...defaultToastOptions,
      ...options,
      icon: '⚠️',
      style: {
        ...defaultToastOptions.style,
        ...getWarningStyle(mode),
        ...(options?.style || {}),
      },
    });
  },
  
  info: (message: string, options?: ToastOptions) => {
    const mode = getMode();
    return toast(message, {
      ...defaultToastOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        ...defaultToastOptions.style,
        ...getInfoStyle(mode),
        ...(options?.style || {}),
      },
    });
  },
  
  loading: (message: string, options?: ToastOptions) => 
    toast.loading(message, { ...loadingOptions, ...options }),
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => 
    toast.promise(promise, messages, { ...defaultToastOptions, ...options }),
  
  custom: (message: string, options?: ToastOptions) => 
    toast(message, { ...defaultToastOptions, ...options }),
  
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  
  remove: (toastId?: string) => toast.remove(toastId),
};

// Toast Provider Component
interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  reverseOrder?: boolean;
  gutter?: number;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  toastOptions?: ToastOptions;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  reverseOrder = false,
  gutter = 8,
  containerClassName,
  containerStyle,
  toastOptions,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const baseBorder = alpha(theme.palette.divider, isDark ? 0.3 : 0.2);

  const themedToastOptions: ToastOptions = {
    ...defaultToastOptions,
    style: {
      borderRadius: '10px',
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      maxWidth: '420px',
      border: `1px solid ${baseBorder}`,
      boxShadow: isDark ? '0 8px 22px rgba(0,0,0,0.6)' : '0 8px 22px rgba(0,0,0,0.08)',
    },
    success: {
      style: {
        background: theme.palette.success.main,
        color: theme.palette.getContrastText(theme.palette.success.main),
        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
      },
    },
    error: {
      style: {
        background: theme.palette.error.main,
        color: theme.palette.getContrastText(theme.palette.error.main),
        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
      },
    },
    loading: {
      duration: Infinity,
      style: {
        background: isDark ? '#374151' : '#e5e7eb',
        color: isDark ? '#fff' : '#111827',
        border: `1px solid ${baseBorder}`,
      },
    },
    blank: {
      style: {
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${baseBorder}`,
      },
    },
  } as ToastOptions;

  return (
    <>
      {children}
      <Toaster
        position={position}
        reverseOrder={reverseOrder}
        gutter={gutter}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        toastOptions={{
          ...themedToastOptions,
          ...toastOptions,
        }}
      />
    </>
  );
};

// Hook for using toast in components
export const useToast = () => {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    loading: showToast.loading,
    promise: showToast.promise,
    custom: showToast.custom,
    dismiss: showToast.dismiss,
    remove: showToast.remove,
  };
};

// Export the toast instance for direct use
export { toast };

export default showToast;