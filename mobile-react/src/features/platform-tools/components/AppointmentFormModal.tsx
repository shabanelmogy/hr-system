import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  Appointment,
  AppointmentInput,
} from '@/src/features/platform-tools/types/platform-tools';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppButton,
  AppDateTimeField,
  AppForm,
  AppFormSection,
  AppSwitchField,
  AppTextField,
} from '@/src/shared/components';

interface AppointmentFormModalProps {
  appointment: Appointment | null;
  initialAllDay?: boolean;
  initialStart?: Date;
  loading: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onSave: (input: AppointmentInput) => Promise<void>;
}

interface AppointmentDraft {
  text: string;
  start: string;
  end: string;
  isAllDay: boolean;
}

export function AppointmentFormModal({
  appointment,
  initialAllDay = false,
  initialStart,
  loading,
  onClose,
  onDelete,
  onSave,
}: AppointmentFormModalProps) {
  const { t } = useTranslation();
  const initial = useMemo(
    () => createInitialDraft(appointment, initialStart, initialAllDay),
    [appointment, initialAllDay, initialStart],
  );
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentDraft, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const update = <Key extends keyof AppointmentDraft>(key: Key, value: AppointmentDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setServerError(null);
  };

  const submit = async () => {
    const nextErrors: Partial<Record<keyof AppointmentDraft, string>> = {};
    if (!draft.text.trim()) nextErrors.text = t('validation.required');
    const start = draft.isAllDay
      ? new Date(`${draft.start.slice(0, 10)}T00:00:00.000Z`)
      : new Date(draft.start);
    const end = draft.isAllDay
      ? new Date(`${draft.end.slice(0, 10)}T00:00:00.000Z`)
      : new Date(draft.end);
    if (!draft.start || Number.isNaN(start.getTime())) nextErrors.start = t('validation.invalidDate');
    if (!draft.end || Number.isNaN(end.getTime())) nextErrors.end = t('validation.invalidDate');
    if (!nextErrors.start && !nextErrors.end && (
      draft.isAllDay ? end < start : end <= start
    )) {
      nextErrors.end = t('platformTools.appointments.endAfterStart');
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: appointment?.id,
        text: draft.text.trim(),
        start: draft.isAllDay
          ? `${draft.start.slice(0, 10)}T00:00:00.000Z`
          : start.toISOString(),
        end: draft.isAllDay
          ? `${addDateKey(draft.end.slice(0, 10), 1)}T00:00:00.000Z`
          : end.toISOString(),
        isAllDay: draft.isAllDay,
      });
    } catch (error) {
      setServerError(getPlatformToolErrorMessage(error, t('platformTools.appointments.saveFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppForm
      errors={errors}
      icon={appointment ? 'create-outline' : 'calendar-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => setErrors((current) => ({ ...current, [name]: undefined }))}
      onSubmit={submit}
      presentation="dialog"
      serverError={serverError}
      submitLabel={t(appointment
        ? 'platformTools.appointments.update'
        : 'platformTools.appointments.create')}
      submitting={busy}
      subtitle={t('platformTools.appointments.formSubtitle')}
      title={t(appointment
        ? 'platformTools.appointments.editTitle'
        : 'platformTools.appointments.addTitle')}
      visible>
      <AppFormSection
        description={t('platformTools.appointments.detailsDescription')}
        divider={false}
        icon="calendar-clear-outline"
        title={t('platformTools.appointments.details')}>
        <AppTextField
          editable={!busy}
          label={t('platformTools.appointments.subject')}
          leadingIcon="text-outline"
          maxLength={200}
          name="text"
          onChangeText={(value) => update('text', value)}
          required
          value={draft.text}
        />
        <AppDateTimeField
          disabled={busy}
          label={t('platformTools.appointments.start')}
          mode={draft.isAllDay ? 'date' : 'datetime'}
          name="start"
          onChangeValue={(value) => update('start', value)}
          required
          value={draft.start}
        />
        <AppDateTimeField
          disabled={busy}
          label={t('platformTools.appointments.end')}
          mode={draft.isAllDay ? 'date' : 'datetime'}
          name="end"
          onChangeValue={(value) => update('end', value)}
          required
          value={draft.end}
        />
        <AppSwitchField
          disabled={busy}
          icon="time-outline"
          label={t('platformTools.appointments.allDay')}
          name="isAllDay"
          onValueChange={(value) => {
            setDraft((current) => switchAllDayMode(current, value));
            setErrors({});
            setServerError(null);
          }}
          value={draft.isAllDay}
        />
        {onDelete ? (
          <AppButton
            disabled={busy}
            icon="trash-outline"
            onPress={onDelete}
            variant="danger">
            {t('platformTools.appointments.delete')}
          </AppButton>
        ) : null}
      </AppFormSection>
    </AppForm>
  );
}

function createInitialDraft(
  appointment: Appointment | null,
  initialStart: Date | undefined,
  initialAllDay: boolean,
): AppointmentDraft {
  if (appointment) {
    if (appointment.isAllDay) {
      const start = utcDateKey(appointment.start);
      const exclusiveEnd = utcDateKey(appointment.end);
      return {
        text: appointment.text,
        start,
        end: addDateKey(exclusiveEnd, -1),
        isAllDay: true,
      };
    }
    return {
      text: appointment.text,
      start: toLocalDateTime(appointment.start),
      end: toLocalDateTime(appointment.end),
      isAllDay: appointment.isAllDay,
    };
  }

  const start = initialStart ? new Date(initialStart) : new Date();
  if (initialAllDay) {
    const dateKey = toLocalDateKey(start);
    return { text: '', start: dateKey, end: dateKey, isAllDay: true };
  }
  start.setMinutes(0, 0, 0);
  if (!initialStart) start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { text: '', start: toLocalDateTime(start), end: toLocalDateTime(end), isAllDay: false };
}

function switchAllDayMode(draft: AppointmentDraft, isAllDay: boolean): AppointmentDraft {
  if (draft.isAllDay === isAllDay) return draft;
  if (isAllDay) {
    const start = toDateKey(draft.start);
    const end = toDateKey(draft.end);
    return { ...draft, start, end: end < start ? start : end, isAllDay: true };
  }

  return {
    ...draft,
    start: `${draft.start.slice(0, 10)}T09:00:00`,
    end: `${draft.end.slice(0, 10)}T10:00:00`,
    isAllDay: false,
  };
}

function utcDateKey(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function toDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return toLocalDateKey(new Date(value));
}

function toLocalDateKey(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDateKey(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toLocalDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
