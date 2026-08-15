import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { useAppFormField } from '@/src/shared/components/forms/AppForm';
import { AppFieldMessage } from '@/src/shared/components/forms/AppFieldMessage';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

export type AppDateTimeMode = 'date' | 'time' | 'datetime';

export interface AppDateTimeFieldProps {
  name?: string;
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  mode?: AppDateTimeMode;
  leadingIcon?: AppIconName;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  showClearButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppDateTimeField({
  name,
  label,
  value,
  onChangeValue,
  mode = 'date',
  leadingIcon = 'calendar-outline',
  placeholder,
  required = false,
  disabled = false,
  error: suppliedError,
  helperText,
  minimumDate,
  maximumDate,
  showClearButton = true,
  style,
}: AppDateTimeFieldProps) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { isReadOnly } = useAppReadOnly();
  const effectiveDisabled = disabled || isReadOnly;
  const selectedDate = useMemo(() => parseDateTime(value, mode), [mode, value]);
  const [draftDate, setDraftDate] = useState(selectedDate ?? new Date());
  const [open, setOpen] = useState(false);
  const formField = useAppFormField(name, openPicker, {
    autoFocus: false,
    enabled: !effectiveDisabled,
  });
  const error = suppliedError ?? formField.error;
  const supportingText = error ?? helperText;

  const commitDate = (date: Date) => {
    formField.clearError();
    onChangeValue(formatDateTime(date, mode));
  };

  function openPicker() {
    if (effectiveDisabled) return;
    const initialDate = selectedDate ?? new Date();

    if (Platform.OS === 'android') {
      setOpen(true);
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: mode === 'time' ? 'time' : 'date',
        minimumDate,
        maximumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type !== 'set' || !date) {
            setOpen(false);
            return;
          }
          if (mode !== 'datetime') {
            commitDate(date);
            setOpen(false);
            return;
          }

          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            onChange: (timeEvent: DateTimePickerEvent, time?: Date) => {
              setOpen(false);
              if (timeEvent.type !== 'set' || !time) return;
              const combined = new Date(date);
              combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
              commitDate(combined);
            },
          });
        },
      });
      return;
    }

    setDraftDate(initialDate);
    setOpen(true);
  }

  return (
    <View style={[styles.field, open && styles.focusedField, style]}>
      <View style={styles.outlineWrapper}>
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled: effectiveDisabled, expanded: open }}
          disabled={effectiveDisabled}
          onPress={openPicker}
          style={[
            styles.control,
            {
              direction,
              backgroundColor: effectiveDisabled ? theme.colors.surfaceMuted : theme.colors.surface,
              borderColor: error
                ? theme.colors.danger
                : open
                  ? theme.colors.primary
                  : theme.colors.border,
              borderRadius: theme.radius.md,
              borderWidth: open ? 2 : 1,
              opacity: effectiveDisabled ? 0.55 : 1,
            },
          ]}>
          <View style={styles.leadingIcon}>
            <AppIcon color={theme.colors.primary} name={leadingIcon} size={21} />
          </View>
          <AppText color={value ? 'default' : 'muted'} numberOfLines={1} style={styles.value}>
            {selectedDate
              ? formatDisplayDate(selectedDate, mode, i18n.language)
              : placeholder ?? label}
          </AppText>
          {showClearButton && value && !effectiveDisabled ? (
            <AppIconButton
              icon="close-outline"
              label={`${t('common.clear')} ${label}`}
              onPress={(event) => {
                event.stopPropagation();
                formField.clearError();
                onChangeValue('');
              }}
              size={20}
            />
          ) : null}
          <AppIcon
            color={theme.colors.textMuted}
            name={isRTL ? 'chevron-back' : 'chevron-down'}
            size={20}
          />
        </Pressable>
        <View
          pointerEvents="none"
          style={[
            styles.floatingLabel,
            isRTL ? styles.floatingLabelRtl : styles.floatingLabelLtr,
            { backgroundColor: effectiveDisabled ? theme.colors.surfaceMuted : theme.colors.surface },
          ]}>
          <AppText
            color={error ? 'danger' : open ? 'primary' : 'default'}
            variant="caption"
            weight="500">
            {label}
            {required ? <AppText color="danger"> *</AppText> : null}
          </AppText>
        </View>
      </View>
      {supportingText ? (
        <AppFieldMessage error={Boolean(error)}>
          {supportingText}
        </AppFieldMessage>
      ) : null}

      {Platform.OS !== 'android' ? (
        <AppModal
          closeLabel={t('common.cancel')}
          footer={
            <View style={[styles.actions, { direction }]}>
              <AppButton onPress={() => setOpen(false)} style={styles.action} variant="ghost">
                {t('common.cancel')}
              </AppButton>
              <AppButton
                onPress={() => {
                  commitDate(draftDate);
                  setOpen(false);
                }}
                style={styles.action}>
                {t('common.save')}
              </AppButton>
            </View>
          }
          onClose={() => setOpen(false)}
          scrollable={false}
          title={label}
          visible={open}>
          <DateTimePicker
            display="spinner"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            mode={mode}
            onChange={(_, date) => date && setDraftDate(date)}
            value={draftDate}
          />
        </AppModal>
      ) : null}
    </View>
  );
}

function parseDateTime(value: string, mode: AppDateTimeMode): Date | null {
  if (!value) return null;
  const parsed = mode === 'date'
    ? new Date(`${value.slice(0, 10)}T12:00:00`)
    : mode === 'time'
      ? new Date(`1970-01-01T${value.slice(0, 5)}:00`)
      : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value: Date, mode: AppDateTimeMode): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  if (mode === 'date') return date;
  if (mode === 'time') return time;
  return `${date}T${time}:00`;
}

function formatDisplayDate(value: Date, mode: AppDateTimeMode, locale: string): string {
  if (mode === 'date') return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(value);
  if (mode === 'time') return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(value);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

const styles = StyleSheet.create({
  field: { width: '100%', gap: 4 },
  focusedField: { paddingTop: 8 },
  outlineWrapper: { position: 'relative', paddingTop: 7 },
  control: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingEnd: 12,
  },
  leadingIcon: {
    width: 42,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { flex: 1, minWidth: 0 },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    maxWidth: '75%',
    paddingHorizontal: 5,
  },
  floatingLabelLtr: { left: 12 },
  floatingLabelRtl: { right: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  action: { minWidth: 110 },
});
