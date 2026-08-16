import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en-gb';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, type ICalendarEventBase, type Mode } from 'react-native-big-calendar';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppointmentFormModal } from '@/src/features/platform-tools/components/AppointmentFormModal';
import {
  useAppointments,
  useDeleteAppointment,
  useSaveAppointment,
} from '@/src/features/platform-tools/hooks/usePlatformTools';
import type {
  Appointment,
  AppointmentInput,
  AppointmentRange,
} from '@/src/features/platform-tools/types/platform-tools';
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
    () => appointments.flatMap(toCalendarEvent),
    [appointments],
  );
  const calendarHeight = getCalendarRenderHeight(calendarViewportHeight, mode);
  const locale = isRTL ? 'ar' : 'en-gb';

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
            message={getPlatformToolErrorMessage(appointmentsQuery.error, t('states.errorMessage'))}
            onRetry={() => void appointmentsQuery.refetch()}
            state="error"
          />
        ) : calendarViewportHeight > 0 ? (
          <AppCard padding="none" style={styles.calendarCard}>
            <Calendar<AppointmentCalendarEvent>
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
            events={calendarEvents}
            height={calendarHeight}
            hourRowHeight={52}
            hourStyle={{ color: theme.colors.textMuted }}
            isRTL={isRTL}
            locale={locale}
            maxVisibleEventCount={3}
            mode={mode}
            moreLabel={t('platformTools.appointments.more', { count: '{moreCount}' })}
            onPressCell={(date) => openNewAppointment(date, mode === 'month')}
            onPressDateHeader={(date) => {
              setVisibleDate(date);
              setMode('day');
            }}
            onPressEvent={(event) => setFormState({ appointment: event.appointment })}
            onSwipeEnd={setVisibleDate}
            scheduleMonthSeparatorStyle={{ color: theme.colors.text, fontWeight: '700' }}
            scrollOffsetMinutes={8 * 60}
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
  let start: Date;
  let end: Date;

  if (appointment.isAllDay) {
    start = localDateFromUtcKey(appointment.start);
    end = localDateFromUtcKey(appointment.end);
  } else {
    start = new Date(appointment.start);
    end = new Date(appointment.end);
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];
  return [{ appointment, title: appointment.text, start, end }];
}

function localDateFromUtcKey(value: string): Date {
  const key = new Date(value).toISOString().slice(0, 10);
  return new Date(`${key}T00:00:00`);
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

const styles = StyleSheet.create({
  screenContent: { flex: 1, gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  primaryAction: { flexShrink: 0 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  periodTitle: { flex: 1, minWidth: 0 },
  calendarViewport: { flex: 1, minHeight: 0 },
  calendarCard: { flex: 1, overflow: 'hidden' },
});
