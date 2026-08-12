import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAppFormField } from '@/src/shared/components/forms/AppForm';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppTextFieldProps extends TextInputProps {
  name?: string;
  label: string;
  error?: string;
  helperText?: string;
  leadingIcon?: AppIconName;
  endAdornment?: ReactNode;
  required?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  counter?: boolean;
  counterFormat?: 'fraction' | 'remaining' | 'percentage';
  warningThreshold?: number;
  errorThreshold?: number;
  showClearButton?: boolean;
  clearButtonAriaLabel?: string;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  numeric?: boolean;
  numericStep?: number;
  showNumericStepper?: boolean;
  minValue?: number;
  maxValue?: number;
}

export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(function AppTextField(
  {
    name,
    label,
    error: suppliedError,
    helperText,
    leadingIcon,
    endAdornment,
    required = false,
    loading = false,
    readOnly = false,
    counter,
    counterFormat = 'fraction',
    warningThreshold = 70,
    errorThreshold = 90,
    showClearButton = true,
    clearButtonAriaLabel,
    onClear,
    showPasswordToggle = true,
    numeric = false,
    numericStep = 1,
    showNumericStepper = true,
    minValue,
    maxValue,
    secureTextEntry = false,
    autoFocus,
    editable = true,
    focusable = true,
    defaultValue,
    maxLength,
    multiline = false,
    inputMode,
    keyboardType,
    onBlur,
    onChangeText,
    onFocus,
    style,
    value,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isRTL, direction } = useLocalization();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const inputId = useId();
  const inputRef = useRef<TextInput | null>(null);
  const currentValue = String(value ?? uncontrolledValue);
  const currentLength = currentValue.length;
  const effectiveEditable = editable && !loading && !readOnly;
  const formField = useAppFormField(
    name,
    () => inputRef.current?.focus(),
    { autoFocus, enabled: effectiveEditable && focusable },
  );
  const error = suppliedError ?? formField.error;
  const supportingText = error ?? helperText;
  const counterVisible = focused && (counter ?? true) && maxLength != null && !secureTextEntry;
  const counterPercentage = maxLength ? (currentLength / maxLength) * 100 : 0;
  const counterColor = counterPercentage > errorThreshold
    ? theme.colors.danger
    : counterPercentage > warningThreshold
      ? theme.colors.warning
      : theme.colors.primary;
  const counterText = maxLength == null
    ? String(currentLength)
    : counterFormat === 'remaining'
      ? String(maxLength - currentLength)
      : counterFormat === 'percentage'
        ? `${Math.round(counterPercentage)}%`
        : `${currentLength}/${maxLength}`;
  const outlineColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;
  const parsedNumericValue = numeric && currentValue !== '' ? Number(currentValue) : Number.NaN;
  const currentNumericValue = Number.isFinite(parsedNumericValue) ? parsedNumericValue : null;
  const decreaseDisabled = !effectiveEditable || (
    currentNumericValue != null && minValue != null && currentNumericValue <= minValue
  );
  const increaseDisabled = !effectiveEditable || (
    currentNumericValue != null && maxValue != null && currentNumericValue >= maxValue
  );

  const setInputRef = useCallback(
    (input: TextInput | null) => {
      inputRef.current = input;
      if (typeof ref === 'function') ref(input);
      else if (ref) ref.current = input;
    },
    [ref],
  );

  const handleChangeText = useCallback(
    (nextValue: string) => {
      let normalizedValue = numeric ? nextValue.replace(/[^0-9]/g, '') : nextValue;

      if (numeric && normalizedValue.length > 1) {
        normalizedValue = normalizedValue.replace(/^0+(?=\d)/, '');
      }

      if (
        numeric &&
        normalizedValue &&
        maxValue != null &&
        Number(normalizedValue) > maxValue
      ) {
        normalizedValue = String(maxValue);
      }

      if (value === undefined) setUncontrolledValue(normalizedValue);
      formField.clearError();
      onChangeText?.(normalizedValue);
    },
    [formField.clearError, maxValue, numeric, onChangeText, value],
  );

  const enforceMinimumValue = useCallback(() => {
    if (!numeric || !currentValue || minValue == null || Number(currentValue) >= minValue) return;

    const nextValue = String(minValue);
    if (value === undefined) setUncontrolledValue(nextValue);
    formField.clearError();
    onChangeText?.(nextValue);
  }, [currentValue, formField.clearError, minValue, numeric, onChangeText, value]);

  const changeNumericValue = useCallback(
    (direction: -1 | 1) => {
      if (!effectiveEditable) return;

      const step = Number.isFinite(numericStep) && numericStep > 0
        ? Math.max(1, Math.trunc(numericStep))
        : 1;
      let nextValue: number;

      if (currentNumericValue == null) {
        nextValue = direction > 0
          ? Math.max(minValue ?? 0, step)
          : (minValue ?? 0);
      } else {
        nextValue = currentNumericValue + direction * step;
      }

      if (minValue != null) nextValue = Math.max(minValue, nextValue);
      if (maxValue != null) nextValue = Math.min(maxValue, nextValue);

      handleChangeText(String(nextValue));
      inputRef.current?.focus();
    }, [
      currentNumericValue,
      effectiveEditable,
      handleChangeText,
      maxValue,
      minValue,
      numericStep,
    ],
  );

  const handleClear = useCallback(() => {
    if (!effectiveEditable) return;
    if (value === undefined) setUncontrolledValue('');
    formField.clearError();
    onChangeText?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [effectiveEditable, formField.clearError, onChangeText, onClear, value]);

  return (
    <View style={[styles.field, { direction }, focused && styles.focusedField]}>
      <View style={styles.outlineWrapper}>
        <View
          style={[
            styles.inputContainer,
            {
              direction,
              backgroundColor: effectiveEditable
                ? theme.colors.surface
                : theme.colors.surfaceMuted,
              borderColor: outlineColor,
              borderRadius: theme.radius.md,
              borderWidth: focused ? 2 : 1,
            },
          ]}>
          {leadingIcon ? (
            <View style={styles.leadingIcon}>
              <AppIcon color={theme.colors.primary} name={leadingIcon} size={21} />
            </View>
          ) : null}

          <TextInput
            {...props}
            accessibilityHint={supportingText}
            accessibilityLabel={`${label}${required ? `, ${t('common.required')}` : ''}`}
            accessibilityState={{ disabled: !effectiveEditable }}
            aria-invalid={Boolean(error)}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            editable={effectiveEditable}
            focusable={focusable}
            inputMode={numeric ? 'numeric' : inputMode}
            keyboardType={numeric ? 'number-pad' : keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            onBlur={(event) => {
              setFocused(false);
              enforceMinimumValue();
              onBlur?.(event);
            }}
            onChangeText={handleChangeText}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            ref={setInputRef}
            secureTextEntry={secureTextEntry && !passwordVisible}
            style={[
              styles.input,
              multiline && styles.multilineInput,
              {
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              },
              style,
            ]}
            value={value}
          />

          {counterVisible ? (
            <View
              accessibilityLabel={counterText}
              accessibilityLiveRegion="polite"
              pointerEvents="none"
              style={[
                styles.counterBadge,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.radius.sm,
                },
              ]}>
              <AppText
                numberOfLines={1}
                style={[styles.counterText, { color: counterColor }]}
                variant="caption"
                weight="600">
                {counterText}
              </AppText>
            </View>
          ) : null}

          {focused && showClearButton && currentLength > 0 && effectiveEditable ? (
            <Pressable
              accessibilityLabel={clearButtonAriaLabel ?? `${t('common.clear')} ${label}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleClear}
              style={styles.actionButton}>
              <AppIcon color={theme.colors.textMuted} name="close-outline" size={21} />
            </Pressable>
          ) : null}

          {secureTextEntry && showPasswordToggle && currentLength > 0 ? (
            <Pressable
              accessibilityLabel={t(passwordVisible ? 'fields.hidePassword' : 'fields.showPassword')}
              accessibilityRole="button"
              disabled={!effectiveEditable}
              hitSlop={8}
              onPress={() => setPasswordVisible((visible) => !visible)}
              style={styles.actionButton}>
              <AppIcon
                color={theme.colors.textMuted}
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={21}
              />
            </Pressable>
          ) : null}

          {numeric && showNumericStepper ? (
            <View
              style={[
                styles.numericStepper,
                { borderStartColor: theme.colors.border },
              ]}>
              <Pressable
                accessibilityLabel={`${t('fields.increase')} ${label}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: increaseDisabled }}
                disabled={increaseDisabled}
                hitSlop={4}
                onPress={() => changeNumericValue(1)}
                style={({ pressed }) => [
                  styles.numericStepButton,
                  pressed && { backgroundColor: theme.colors.surfaceMuted },
                  increaseDisabled && styles.numericStepButtonDisabled,
                ]}>
                <AppIcon color={theme.colors.textMuted} name="chevron-up" size={16} />
              </Pressable>
              <Pressable
                accessibilityLabel={`${t('fields.decrease')} ${label}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: decreaseDisabled }}
                disabled={decreaseDisabled}
                hitSlop={4}
                onPress={() => changeNumericValue(-1)}
                style={({ pressed }) => [
                  styles.numericStepButton,
                  styles.numericStepButtonBottom,
                  { borderTopColor: theme.colors.border },
                  pressed && { backgroundColor: theme.colors.surfaceMuted },
                  decreaseDisabled && styles.numericStepButtonDisabled,
                ]}>
                <AppIcon color={theme.colors.textMuted} name="chevron-down" size={16} />
              </Pressable>
            </View>
          ) : null}

          {endAdornment}
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.floatingLabel,
            isRTL ? styles.floatingLabelRtl : styles.floatingLabelLtr,
            {
              backgroundColor: effectiveEditable
                ? theme.colors.surface
                : theme.colors.surfaceMuted,
            },
          ]}>
          <AppText
            color={error ? 'danger' : focused ? 'primary' : 'default'}
            nativeID={`${inputId}-label`}
            numberOfLines={1}
            style={styles.labelText}
            variant="caption"
            weight="500">
            {label}
            {required ? <AppText color="danger"> *</AppText> : null}
          </AppText>
        </View>
      </View>

      {supportingText ? (
        <AppText color={error ? 'danger' : 'muted'} style={styles.supportingText} variant="caption">
          {supportingText}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 4,
  },
  focusedField: {
    paddingTop: 8,
  },
  outlineWrapper: {
    position: 'relative',
    paddingTop: 7,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    alignSelf: 'stretch',
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    maxWidth: '75%',
    paddingHorizontal: 5,
  },
  floatingLabelLtr: {
    left: 12,
  },
  floatingLabelRtl: {
    right: 12,
  },
  labelText: {
    lineHeight: 16,
  },
  leadingIcon: {
    width: 42,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  actionButton: {
    width: 40,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericStepper: {
    width: 34,
    minHeight: 52,
    alignSelf: 'stretch',
    borderStartWidth: StyleSheet.hairlineWidth,
  },
  numericStepButton: {
    flex: 1,
    minHeight: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericStepButtonBottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  numericStepButtonDisabled: {
    opacity: 0.35,
  },
  supportingText: {
    paddingHorizontal: 12,
  },
});
