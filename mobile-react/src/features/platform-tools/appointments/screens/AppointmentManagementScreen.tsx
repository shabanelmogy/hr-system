import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en-gb';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  Calendar,
  type CalendarTouchableOpacityProps,
  type ICalendarEventBase,
  type Mode,
} from 'react-native-big-calendar';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppointmentFormModal } from '@/src/features/platform-tools/appointments/components/AppointmentFormModal';
import {
  useAppointments,
  useDeleteAppointment,
  useSaveAppointment,
} from '@/src/features/platform-tools/appointments/hooks';
import type {
  Appointment,
  AppointmentInput,
  AppointmentRange,
} from '@/src/features/platform-tools/appointments/types';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppButton,
  AppCard,
  AppIconButton,
  AppPageHeader,
  AppScreen,
  AppSegmentedControl,
  AppStateView,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';

type AppointmentCalendarMode = Extract<Mode, 'month' | 'week' | 'day' | 'schedule'>;

interface AppointmentCalendarEvent extends ICalendarEventBase {
  appointment: Appointment;
  isAllDay: boolean;
}

interface AppointmentFormState {
  appointment: Appointment | null;
  initialAllDay?: boolean;
  initialStart?: Date;
}

export function AppointmentManagementScreen() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<AppointmentCalendarMode>('month');
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const [calendarViewportHeight, setCalendarViewportHeight] = useState(0);
  const [formState, setFormState] = useState<AppointmentFormState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);
  const weekStartsOn = isRTL ? 6 : 1;
  const range = useMemo(
    () => createAppointmentRange(visibleDate, mode, weekStartsOn),
    [mode, visibleDate, weekStartsOn],
  );
  const appointmentsQuery = useAppointments(range);
  const saveMutation = useSaveAppointment(range);
  const deleteMutation = useDeleteAppointment(range);
  const appointments = useMemo(
    () => appointmentsQuery.data ?? [],
    [appointmentsQuery.data],
  );
  const calendarEvents = useMemo(
    () => appointments
      .flatMap(toCalendarEvent)
      .sort((first, second) => first.start.getTime() - second.start.getTime()),
    [appointments],
  );
  const calendarHeight = getCalendarRenderHeight(calendarViewportHeight, mode);
  const locale = isRTL ? 'ar' : 'en-gb';
  const compactViewPicker = width < 520;
  const maxVisibleEventCount = width < 600 || calendarViewportHeight < 500 ? 1 : 2;
  const scrollOffsetMinutes = useMemo(
    () => getCalendarScrollOffset(calendarEvents, range, mode),
    [calendarEvents, mode, range],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    [i18n.language],
  );

  const renderCalendarEvent = useCallback((
    event: AppointmentCalendarEvent,
    touchableOpacityProps: CalendarTouchableOpacityProps,
  ) => {
    const { key, style, ...pressableProps } = touchableOpacityProps;

    return (
      <TouchableOpacity
        {...pressableProps}
        accessibilityLabel={event.title}
        accessibilityRole="button"
        key={key}
        style={[style, styles.eventCell]}>
        <AppText
          align={isRTL ? 'right' : 'left'}
          color="inverse"
          numberOfLines={mode === 'day' ? 2 : 1}
          style={styles.eventTitle}
          variant="caption"
          weight="700">
          {event.title}
        </AppText>
        {mode !== 'month' && !event.isAllDay ? (
          <AppText
            align={isRTL ? 'right' : 'left'}
            color="inverse"
            numberOfLines={1}
            style={styles.eventTime}
            variant="caption">
            {timeFormatter.format(event.start)}
          </AppText>
        ) : null}
      </TouchableOpacity>
    );
  }, [isRTL, mode, timeFormatter]);

  const save = async (input: AppointmentInput) => {
    await saveMutation.mutateAsync(input);
    setFormState(null);
    showToast.success(t('platformTools.appointments.saved'));
  };

  const remove = async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
    showToast.success(t('platformTools.appointments.deleted'));
  };

  const openNewAppointment = useCallback((date = new Date(), allDay = false) => {
    if (dayjs(date).startOf('day').isBefore(dayjs().startOf('day'))) {
      showToast.warning(t('platformTools.appointments.pastStart'));
      return;
    }
    setFormState({ appointment: null, initialAllDay: allDay, initialStart: date });
  }, [t]);

  const movePeriod = (direction: -1 | 1) => {
    const unit = mode === 'day' ? 'day' : mode === 'week' ? 'week' : 'month';
    setVisibleDate((current) => dayjs(current).add(direction, unit).toDate());
  };

  const periodTitle = useMemo(
    () => formatPeriodTitle(visibleDate, mode, i18n.language, weekStartsOn),
    [i18n.language, mode, visibleDate, weekStartsOn],
  );

  return (
    <AppScreen
      contentContainerStyle={styles.screenContent}
      edges={['left', 'right', 'bottom']}
      keyboardAware={false}
      scroll={false}>
      <AppPageHeader
        action={(
          <View style={styles.headerActions}>
            <AppIconButton
              disabled={appointmentsQuery.isFetching}
              icon="refresh-outline"
              label={t('common.retry')}
              onPress={() => void appointmentsQuery.refetch()}
            />
            <AppIconButton
              color={theme.colors.onPrimary}
              icon="add-outline"
              label={t('platformTools.appointments.add')}
              onPress={() => openNewAppointment()}
              pressedBackgroundColor={theme.colors.secondary}
              style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
            />
          </View>
        )}
        subtitle={t('platformTools.appointmentsDescription')}
        title={t('navigation.appointments')}
      />

      <AppSegmentedControl
        label={t('platformTools.appointments.view')}
        layout="equal"
        onChange={setMode}
        options={[
          { icon: 'calendar-outline', label: t('platformTools.appointments.month'), value: 'month' },
          { icon: 'grid-outline', label: t('platformTools.appointments.week'), value: 'week' },
          { icon: 'today-outline', label: t('platformTools.appointments.day'), value: 'day' },
          { icon: 'list-outline', label: t('platformTools.appointments.agenda'), value: 'schedule' },
        ]}
        showOptionLabels={!compactViewPicker}
        value={mode}
        variant="pill"
      />

      <View style={[styles.navigation, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        <AppIconButton
          icon={isRTL ? 'chevron-forward-outline' : 'chevron-back-outline'}
          label={t('platformTools.appointments.previousPeriod')}
          onPress={() => movePeriod(-1)}
        />
        <View style={styles.periodTitle}>
          <AppText align="center" numberOfLines={1} variant="label">
            {periodTitle}
          </AppText>
          <AppText align="center" color="muted" variant="caption">
            {t('platformTools.appointments.appointmentCount', { count: appointments.length })}
          </AppText>
        </View>
        <AppButton
          icon="today-outline"
          onPress={() => setVisibleDate(new Date())}
          variant="outline">
          {t('platformTools.appointments.today')}
        </AppButton>
        <AppIconButton
          icon={isRTL ? 'chevron-back-outline' : 'chevron-forward-outline'}
          label={t('platformTools.appointments.nextPeriod')}
          onPress={() => movePeriod(1)}
        />
      </View>

      <View
        onLayout={({ nativeEvent }) => {
          const nextHeight = Math.floor(nativeEvent.layout.height);
          setCalendarViewportHeight((current) => current === nextHeight ? current : nextHeight);
        }}
        style={styles.calendarViewport}>
        {appointmentsQuery.isLoading ? (
          <AppStateView state="loading" />
        ) : appointmentsQuery.error ? (
          <AppStateView
            message={getPlatformToolErrorMessage(appointmentsQuery.error, t('feedback.unknownError'))}
            onRetry={() => void appointmentsQuery.refetch()}
            state="error"
          />
        ) : calendarViewportHeight > 0 ? (
          <AppCard padding="none" style={styles.calendarCard}>
            <Calendar<AppointmentCalendarEvent>
            key={`${mode}:${locale}:${weekStartsOn}`}
            activeDate={visibleDate}
            allDayEventCellStyle={{ backgroundColor: theme.colors.primary }}
            allDayEventCellTextColor={theme.colors.onPrimary}
            ampm
            bodyContainerStyle={{ backgroundColor: theme.colors.surface }}
            calendarCellStyle={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
            calendarCellTextStyle={{ color: theme.colors.textMuted }}
            date={visibleDate}
            dayHeaderHighlightColor={theme.colors.primary}
            eventCellStyle={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.secondary,
              borderRadius: theme.radius.sm,
            }}
            eventCellTextColor={theme.colors.onPrimary}
            eventMinHeightForMonthView={20}
            enableEnrichedEvents={mode === 'week' || mode === 'day'}
            events={calendarEvents}
            eventsAreSorted
            height={calendarHeight}
            hourRowHeight={52}
            hourStyle={{ color: theme.colors.textMuted }}
            isRTL={isRTL}
            locale={locale}
            maxVisibleEventCount={maxVisibleEventCount}
            mode={mode}
            moreLabel={t('platformTools.appointments.more', { count: '{moreCount}' })}
            onPressCell={(date) => openNewAppointment(date, mode === 'month')}
            onPressDateHeader={(date) => {
              setVisibleDate(date);
              setMode('day');
            }}
            onPressEvent={(event) => setFormState({ appointment: event.appointment })}
            onPressMoreLabel={(events) => {
              const firstEvent = events[0];
              if (!firstEvent) return;
              setVisibleDate(firstEvent.start);
              setMode('day');
            }}
            onSwipeEnd={setVisibleDate}
            renderEvent={renderCalendarEvent}
            scheduleMonthSeparatorStyle={{ color: theme.colors.text, fontWeight: '700' }}
            scrollOffsetMinutes={scrollOffsetMinutes}
            showAdjacentMonths
            showTime
            showVerticalScrollIndicator
            swipeEnabled
            theme={{
              isRTL,
              palette: {
                primary: { main: theme.colors.primary, contrastText: theme.colors.onPrimary },
                nowIndicator: theme.colors.danger,
                gray: {
                  100: theme.colors.surfaceMuted,
                  200: theme.colors.border,
                  300: theme.colors.border,
                  500: theme.colors.textMuted,
                  800: theme.colors.text,
                },
                moreLabel: theme.colors.primary,
              },
            }}
            weekDayHeaderHighlightColor={theme.colors.primary}
            weekStartsOn={weekStartsOn}
            />
          </AppCard>
        ) : null}
      </View>

      {formState ? (
        <AppointmentFormModal
          appointment={formState.appointment}
          initialAllDay={formState.initialAllDay}
          initialStart={formState.initialStart}
          loading={saveMutation.isPending}
          onClose={() => setFormState(null)}
          onDelete={formState.appointment ? () => {
            setPendingDelete(formState.appointment);
            setFormState(null);
          } : undefined}
          onSave={save}
        />
      ) : null}

      <ConfirmationDialog
        confirmLabel={t('platformTools.appointments.delete')}
        description={t('platformTools.appointments.deleteDescription', {
          name: pendingDelete?.text ?? '',
        })}
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
        title={t('platformTools.appointments.deleteTitle')}
        tone="danger"
        visible={pendingDelete !== null}
      />
    </AppScreen>
  );
}

function toCalendarEvent(appointment: Appointment): AppointmentCalendarEvent[] {
  const isAllDay = appointment.isAllDay || isLegacyAllDayAppointment(appointment);
  let start: Date;
  let end: Date;

  if (isAllDay) {
    const startKey = utcDateKey(appointment.start);
    const exclusiveEndKey = utcDateKey(appointment.end);
    const inclusiveEndKey = exclusiveEndKey > startKey
      ? addUtcDateKey(exclusiveEndKey, -1)
      : startKey;
    start = localDateFromKey(startKey);
    end = localDateFromKey(inclusiveEndKey);
  } else {
    start = new Date(appointment.start);
    end = new Date(appointment.end);
  }

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    (isAllDay ? end < start : end <= start)
  ) {
    return [];
  }

  const normalizedAppointment = isAllDay && !appointment.isAllDay
    ? { ...appointment, isAllDay: true }
    : appointment;
  return [{
    appointment: normalizedAppointment,
    isAllDay,
    title: appointment.text,
    start,
    end,
  }];
}

function utcDateKey(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function localDateFromKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

function addUtcDateKey(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isLegacyAllDayAppointment(appointment: Appointment): boolean {
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const duration = end.getTime() - start.getTime();

  return (
    Number.isFinite(duration) &&
    duration >= dayInMilliseconds &&
    duration % dayInMilliseconds === 0 &&
    start.getUTCHours() === 12 &&
    end.getUTCHours() === 12 &&
    start.getUTCMinutes() === 0 &&
    end.getUTCMinutes() === 0
  );
}

function createAppointmentRange(
  visibleDate: Date,
  mode: AppointmentCalendarMode,
  weekStartsOn: number,
): AppointmentRange {
  const active = dayjs(visibleDate);
  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  if (mode === 'day') {
    start = active.startOf('day');
    end = start.add(1, 'day');
  } else if (mode === 'week') {
    const daysSinceWeekStart = (active.day() - weekStartsOn + 7) % 7;
    start = active.startOf('day').subtract(daysSinceWeekStart, 'day');
    end = start.add(7, 'day');
  } else {
    const monthStart = active.startOf('month');
    const daysSinceWeekStart = (monthStart.day() - weekStartsOn + 7) % 7;
    start = monthStart.subtract(daysSinceWeekStart, 'day');
    end = active.endOf('month').add(7, 'day').endOf('day');
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function formatPeriodTitle(
  visibleDate: Date,
  mode: AppointmentCalendarMode,
  locale: string,
  weekStartsOn: number,
): string {
  if (mode === 'day') {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(visibleDate);
  }
  if (mode === 'week') {
    const active = dayjs(visibleDate);
    const daysSinceWeekStart = (active.day() - weekStartsOn + 7) % 7;
    const start = active.subtract(daysSinceWeekStart, 'day').toDate();
    const end = dayjs(start).add(6, 'day').toDate();
    const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  }
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(visibleDate);
}

function getCalendarRenderHeight(
  viewportHeight: number,
  mode: AppointmentCalendarMode,
): number {
  const innerHeight = Math.max(1, viewportHeight - 2);
  if (mode === 'month') return Math.max(1, innerHeight - 32);
  if (mode === 'week' || mode === 'day') return innerHeight + 52;
  return innerHeight;
}

function getCalendarScrollOffset(
  events: readonly AppointmentCalendarEvent[],
  range: AppointmentRange,
  mode: AppointmentCalendarMode,
): number {
  if (mode !== 'week' && mode !== 'day') return 0;

  const rangeStart = new Date(range.start);
  const rangeEnd = new Date(range.end);
  const visibleTimedEvents = events.filter((event) => (
    !event.isAllDay && event.end > rangeStart && event.start < rangeEnd
  ));

  if (visibleTimedEvents.length === 0) return 8 * 60;

  const earliestStart = Math.min(...visibleTimedEvents.map((event) => (
    event.start <= rangeStart
      ? 0
      : event.start.getHours() * 60 + event.start.getMinutes()
  )));

  return Math.max(0, Math.min(20 * 60, earliestStart - 60));
}

const styles = StyleSheet.create({
  screenContent: { flex: 1, gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  primaryAction: { flexShrink: 0 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  periodTitle: { flex: 1, minWidth: 0 },
  calendarViewport: { flex: 1, minHeight: 0 },
  calendarCard: { flex: 1, overflow: 'hidden' },
  eventCell: {
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  eventTitle: { lineHeight: 15 },
  eventTime: { fontSize: 10, lineHeight: 12, opacity: 0.9 },
});
