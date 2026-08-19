import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { type StyleProp, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { DiscardChangesDialog } from '@/src/shared/components/dialogs/discard-changes/DiscardChangesDialog';
import { useDiscardChanges } from '@/src/shared/components/dialogs/discard-changes/useDiscardChanges';
import { AppAlert } from '@/src/shared/components/feedback/AppAlert';
import type { AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

interface FocusableField {
  focus: () => void;
}

interface RegisteredField {
  autoFocus: boolean | undefined;
  field: FocusableField;
  name?: string;
  registrationId: symbol;
}

type RegisterField = (
  field: FocusableField,
  options: { autoFocus?: boolean; name?: string },
) => () => void;

interface AppFormContextValue {
  clearError?: (name: string) => void;
  errors: Partial<Record<string, string>>;
  focusNextField: (field: FocusableField) => boolean;
  registerField: RegisterField;
}

const AppFormContext = createContext<AppFormContextValue | null>(null);

export interface AppFormProps extends PropsWithChildren<Omit<ViewProps, 'children' | 'style'>> {
  autoFocusFirstInput?: boolean;
  errors?: Partial<Record<string, string>>;
  focusErrorRequestId?: number;
  onClearFieldError?: (name: string) => void;
  presentation?: 'inline' | 'dialog' | 'fullScreen';
  visible?: boolean;
  title?: string;
  subtitle?: string;
  icon?: AppIconName;
  onCancel?: () => void;
  onSubmit?: () => void | Promise<void>;
  cancelLabel?: string;
  submitLabel?: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  isDirty?: boolean;
  serverError?: string | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppForm({
  autoFocusFirstInput = true,
  children,
  errors = {},
  focusErrorRequestId,
  onClearFieldError,
  presentation = 'inline',
  visible = true,
  title,
  subtitle,
  icon,
  onCancel,
  onSubmit,
  cancelLabel,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  isDirty = false,
  serverError,
  contentContainerStyle,
  footer,
  style,
  ...viewProps
}: AppFormProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { isReadOnly } = useAppReadOnly();
  const fieldsRef = useRef<RegisteredField[]>([]);
  const errorsRef = useRef(errors);
  const focusFrameRef = useRef<number | null>(null);
  const errorFocusFrameRef = useRef<number | null>(null);
  const hasFocusedRef = useRef(false);
  const active = presentation === 'inline' || visible;
  const activeRef = useRef(active);
  errorsRef.current = errors;
  activeRef.current = active;
  const {
    dialogVisible: discardDialogVisible,
    discard,
    keepEditing,
    requestClose,
  } = useDiscardChanges({
    active,
    busy: submitting,
    isDirty,
    onDiscard: onCancel,
  });

  const scheduleInitialFocus = useCallback(() => {
    if (
      !activeRef.current ||
      !autoFocusFirstInput ||
      hasFocusedRef.current ||
      focusFrameRef.current !== null
    ) {
      return;
    }

    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      const firstField = fieldsRef.current.find(({ autoFocus }) => autoFocus !== false);
      if (!firstField) return;
      hasFocusedRef.current = true;
      firstField.field.focus();
    });
  }, [autoFocusFirstInput]);

  const registerField = useCallback<RegisterField>(
    (field, options) => {
      const registrationId = Symbol('form-field');
      fieldsRef.current.push({
        autoFocus: options.autoFocus,
        field,
        name: options.name,
        registrationId,
      });
      scheduleInitialFocus();

      return () => {
        fieldsRef.current = fieldsRef.current.filter(
          (registeredField) => registeredField.registrationId !== registrationId,
        );
      };
    },
    [scheduleInitialFocus],
  );

  const focusNextField = useCallback((currentField: FocusableField) => {
    if (!activeRef.current) return false;

    const currentIndex = fieldsRef.current.findIndex(({ field }) => field === currentField);
    const nextField = currentIndex >= 0 ? fieldsRef.current[currentIndex + 1] : undefined;
    if (!nextField) return false;

    nextField.field.focus();
    return true;
  }, []);

  useEffect(() => {
    if (!active) {
      hasFocusedRef.current = false;
      return;
    }
    scheduleInitialFocus();
  }, [active, scheduleInitialFocus]);

  const focusFirstError = useCallback(() => {
    if (errorFocusFrameRef.current !== null) {
      cancelAnimationFrame(errorFocusFrameRef.current);
    }

    errorFocusFrameRef.current = requestAnimationFrame(() => {
      errorFocusFrameRef.current = null;
      const firstInvalidField = fieldsRef.current.find(
        ({ name }) => name && errorsRef.current[name],
      );
      firstInvalidField?.field.focus();
    });
  }, []);

  useEffect(() => {
    if (focusErrorRequestId == null) return;
    focusFirstError();
  }, [focusErrorRequestId, focusFirstError]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;
    await onSubmit();
    focusFirstError();
  }, [focusFirstError, onSubmit]);

  useEffect(
    () => () => {
      if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
      if (errorFocusFrameRef.current !== null) {
        cancelAnimationFrame(errorFocusFrameRef.current);
      }
    },
    [],
  );

  const contextValue = useMemo<AppFormContextValue>(
    () => ({ clearError: onClearFieldError, errors, focusNextField, registerField }),
    [errors, focusNextField, onClearFieldError, registerField],
  );

  const actionFooter = footer ?? (onCancel || onSubmit ? (
    <View style={[styles.actions, { direction }]}>
      {onCancel ? (
        <AppButton
          disabled={submitting}
          icon="close-outline"
          onPress={requestClose}
          style={styles.action}
          variant="outline">
          {cancelLabel ?? t('common.cancel')}
        </AppButton>
      ) : null}
      {onSubmit ? (
        <AppButton
          disabled={submitDisabled || submitting || isReadOnly}
          icon="save-outline"
          loading={submitting}
          onPress={() => void handleSubmit()}
          style={styles.action}>
          {submitLabel ?? t('common.save')}
        </AppButton>
      ) : null}
    </View>
  ) : null);

  const formContent = (
    <AppFormContext.Provider value={contextValue}>
      <View {...viewProps} style={style}>
        {children}
        {serverError ? <AppAlert severity="error">{serverError}</AppAlert> : null}
        {presentation === 'inline' ? actionFooter : null}
      </View>
    </AppFormContext.Provider>
  );

  if (presentation === 'inline') return formContent;

  return (
    <>
      <AppModal
        closeDisabled={submitting}
        closeLabel={cancelLabel ?? t('common.cancel')}
        contentContainerStyle={contentContainerStyle}
        footer={actionFooter}
        icon={icon}
        onClose={onCancel ? requestClose : undefined}
        showCloseButton={Boolean(onCancel)}
        subtitle={subtitle}
        title={title ?? ''}
        variant={presentation}
        visible={visible}>
        {formContent}
      </AppModal>
      <DiscardChangesDialog
        loading={submitting}
        onCancel={keepEditing}
        onDiscard={discard}
        visible={visible && discardDialogVisible}
      />
    </>
  );
}

export function useAppFormField(
  name: string | undefined,
  focus: () => void,
  options: { autoFocus?: boolean; enabled?: boolean } = {},
) {
  const context = useContext(AppFormContext);
  const registerField = context?.registerField;
  const clearFieldError = context?.clearError;
  const focusNextField = context?.focusNextField;
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const field = useMemo<FocusableField>(() => ({ focus: () => focusRef.current() }), []);
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!registerField || !enabled) return;
    return registerField(field, { autoFocus: options.autoFocus, name });
  }, [enabled, field, name, options.autoFocus, registerField]);

  const clearError = useCallback(() => {
    if (name) clearFieldError?.(name);
  }, [clearFieldError, name]);

  const focusNext = useCallback(
    () => focusNextField?.(field) ?? false,
    [field, focusNextField],
  );

  return {
    clearError,
    error: name ? context?.errors[name] : undefined,
    focusNext,
  };
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  action: {
    flex: 1,
    maxWidth: 220,
  },
});
