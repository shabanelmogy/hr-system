import type { DateSelectArg, DatesSetArg, EventDropArg, EventClickArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "@/shared/components/feedback/transient";
import {
  appointmentFormToCreateRequest,
  appointmentFormToUpdateRequest,
  appointmentToCalendarEvent,
  calendarEventToAppointmentForm,
  calendarEventToUpdateRequest,
  getInitialAppointmentRange,
  selectionToAppointmentForm,
} from "../adapters/appointmentCalendarAdapter";
import type { AppointmentFormData, AppointmentRange } from "../types/appointment";
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "./useAppointmentQueries";

const emptyAppointment = (): AppointmentFormData => ({
  text: "",
  start: dayjs().toISOString(),
  end: dayjs().add(1, "hour").toISOString(),
  isAllDay: false,
});

export function useAppointmentCalendar() {
  const { t } = useTranslation();
  const [range, setRange] = useState<AppointmentRange>(getInitialAppointmentRange);
  const appointmentsQuery = useAppointments(range);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formDefaults, setFormDefaults] = useState<AppointmentFormData>(emptyAppointment);

  const events = useMemo(
    () => (appointmentsQuery.data ?? []).map(appointmentToCalendarEvent),
    [appointmentsQuery.data],
  );

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const onSelect = (selection: DateSelectArg) => {
    selection.view.calendar.unselect();

    if (dayjs(selection.start).startOf("day").isBefore(dayjs().startOf("day"))) {
      showToast.warning(t("appointments.validation.pastStart"));
      return;
    }

    setEditingId(null);
    setFormDefaults(selectionToAppointmentForm(selection));
    setDialogOpen(true);
  };

  const submitAppointment = async (data: AppointmentFormData) => {
    try {
      if (editingId == null) {
        await createMutation.mutateAsync(appointmentFormToCreateRequest(data));
      } else {
        await updateMutation.mutateAsync(appointmentFormToUpdateRequest(editingId, data));
      }
      closeDialog();
    } catch (error) {
      showToast.error(error);
    }
  };

  const deleteAppointment = async () => {
    if (editingId == null) return;

    try {
      await deleteMutation.mutateAsync(editingId);
      closeDialog();
    } catch (error) {
      showToast.error(error);
    }
  };

  const persistCalendarEvent = async ({ event, revert }: EventDropArg | EventResizeDoneArg) => {
    const payload = calendarEventToUpdateRequest(event);

    if (!payload || !dayjs(payload.end).isAfter(dayjs(payload.start))) {
      revert();
      showToast.warning(t("appointments.validation.endAfterStart"));
      return;
    }

    try {
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      revert();
      showToast.error(error);
    }
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    const id = Number(clickInfo.event.id);
    if (!Number.isInteger(id) || id <= 0) return;

    setEditingId(id);
    setFormDefaults(calendarEventToAppointmentForm(clickInfo.event));
    setDialogOpen(true);
  };

  const onDatesSet = (dates: DatesSetArg) => {
    const nextRange = {
      start: dates.start.toISOString(),
      end: dates.end.toISOString(),
    };
    setRange((current) =>
      current.start === nextRange.start && current.end === nextRange.end
        ? current
        : nextRange,
    );
  };

  return {
    closeDialog,
    deleteAppointment,
    dialogOpen,
    editingId,
    events,
    formDefaults,
    isError: appointmentsQuery.isError,
    isLoading: appointmentsQuery.isLoading,
    isMutationPending:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    onDatesSet,
    onEventDrop: persistCalendarEvent,
    onEventResize: persistCalendarEvent,
    onEventClick,
    onSelect,
    refetch: appointmentsQuery.refetch,
    submitAppointment,
  };
}
