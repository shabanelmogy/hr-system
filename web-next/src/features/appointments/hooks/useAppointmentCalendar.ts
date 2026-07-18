import type { DateSelectArg, EventChangeArg, EventClickArg } from "@fullcalendar/core";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { showToast } from "@/shared/components/feedback/transient";
import type { AppointmentFormData } from "../validation/appointmentValidation";
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "./useAppointmentQueries";

const monthView = "dayGridMonth";
const todayStart = dayjs().startOf("day");

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAppointmentCalendar() {
  const { data: appointments = [], isLoading } = useAppointments();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStart, setDefaultStart] = useState(() => dayjs().toISOString());
  const [defaultEnd, setDefaultEnd] = useState(() => dayjs().add(1, "hour").toISOString());
  const [defaultTitle, setDefaultTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState(monthView);

  const events = useMemo(() => {
    if (currentView === monthView) {
      return appointments.map((appointment) => {
        const startUtc = new Date(appointment.start).toISOString().slice(0, 10);
        const endUtc = new Date(appointment.end || appointment.start).toISOString().slice(0, 10);
        const startDay = dayjs(startUtc);
        const endDay = dayjs(endUtc);

        return {
          id: String(appointment.id),
          title: appointment.text,
          start: startUtc,
          end: endDay.isAfter(startDay)
            ? endDay.format("YYYY-MM-DD")
            : startDay.add(1, "day").format("YYYY-MM-DD"),
          allDay: true,
        };
      });
    }

    return appointments.map((appointment) => ({
      id: String(appointment.id),
      title: appointment.text,
      start: appointment.start,
      end: appointment.end,
    }));
  }, [appointments, currentView]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const onSelect = (selectInfo: DateSelectArg) => {
    selectInfo.view.calendar.unselect();

    if (dayjs(selectInfo.start).startOf("day").isBefore(todayStart)) {
      showToast.warning("You cannot add appointments in previous days");
      return;
    }

    const end =
      selectInfo.endStr ||
      new Date(selectInfo.start.getTime() + 60 * 60 * 1000).toISOString();

    setEditingId(null);
    setDefaultTitle("");
    setDefaultStart(selectInfo.startStr);
    setDefaultEnd(
      currentView === monthView
        ? dayjs(end).subtract(1, "day").format("YYYY-MM-DD")
        : end,
    );
    setDialogOpen(true);
  };

  const createAppointment = (data: AppointmentFormData) => {
    const payload =
      currentView === monthView
        ? {
            start: `${dayjs(data.start).format("YYYY-MM-DD")}T12:00:00Z`,
            end: `${dayjs(data.end).add(1, "day").format("YYYY-MM-DD")}T12:00:00Z`,
            text: data.text,
          }
        : {
            start: dayjs(data.start).format("YYYY-MM-DDTHH:mm:ss"),
            end: dayjs(data.end).format("YYYY-MM-DDTHH:mm:ss"),
            text: data.text,
          };

    createMutation.mutate(payload, {
      onSuccess: closeDialog,
      onError: (error) => showToast.error(errorMessage(error, "Failed to create appointment")),
    });
  };

  const updateAppointment = (data: AppointmentFormData) => {
    if (editingId == null) return;

    const payload =
      currentView === monthView
        ? {
            id: editingId,
            start: `${dayjs(data.start).format("YYYY-MM-DD")}T12:00:00Z`,
            end: `${dayjs(data.end).add(1, "day").format("YYYY-MM-DD")}T12:00:00Z`,
            text: data.text,
          }
        : {
            id: editingId,
            start: dayjs(data.start).format("YYYY-MM-DDTHH:mm:ss"),
            end: dayjs(data.end).format("YYYY-MM-DDTHH:mm:ss"),
            text: data.text,
          };

    updateMutation.mutate(payload, {
      onSuccess: closeDialog,
      onError: (error) => showToast.error(errorMessage(error, "Failed to update appointment")),
    });
  };

  const submitAppointment = (data: AppointmentFormData) => {
    if (editingId == null) createAppointment(data);
    else updateAppointment(data);
  };

  const deleteAppointment = () => {
    if (editingId == null) return;

    deleteMutation.mutate(editingId, {
      onSuccess: closeDialog,
      onError: (error) => showToast.error(errorMessage(error, "Failed to delete appointment")),
    });
  };

  const onEventChange = (changeInfo: EventChangeArg) => {
    const event = changeInfo.event;
    const id = Number(event.id);
    const revertWithError = (error: unknown, fallback: string) => {
      changeInfo.revert();
      showToast.error(errorMessage(error, fallback));
    };

    if (event.allDay || currentView === monthView) {
      const start = event.startStr;
      const end = event.endStr || event.startStr;
      const lastIncludedDay = dayjs(end).subtract(1, "day");

      if (dayjs(start).isBefore(todayStart) || lastIncludedDay.isBefore(todayStart)) {
        revertWithError(undefined, "Appointments cannot be moved to a previous day");
        return;
      }

      if (!dayjs(end).isAfter(dayjs(start))) {
        revertWithError(undefined, "End must be after Start");
        return;
      }

      updateMutation.mutate(
        { id, start: `${start}T12:00:00Z`, end: `${end}T12:00:00Z`, text: event.title },
        { onError: (error) => revertWithError(error, "Failed to update appointment") },
      );
      return;
    }

    const start = event.start ? dayjs(event.start) : dayjs();
    const end = event.end ? dayjs(event.end) : start;

    if (start.startOf("day").isBefore(todayStart) || end.startOf("day").isBefore(todayStart)) {
      revertWithError(undefined, "Appointments cannot be moved to a previous day");
      return;
    }

    if (!end.isAfter(start)) {
      revertWithError(undefined, "End must be after Start");
      return;
    }

    updateMutation.mutate(
      { id, start: start.toISOString(), end: end.toISOString(), text: event.title },
      { onError: (error) => revertWithError(error, "Failed to update appointment") },
    );
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const isAllDay = event.allDay || currentView === monthView;
    const start = isAllDay
      ? event.startStr
      : event.start?.toISOString() || new Date().toISOString();
    const end = isAllDay
      ? event.endStr || event.startStr
      : event.end?.toISOString() || start;

    setEditingId(Number(event.id));
    setDefaultTitle(event.title);
    setDefaultStart(start);
    setDefaultEnd(isAllDay ? dayjs(end).subtract(1, "day").format("YYYY-MM-DD") : end);
    setDialogOpen(true);
  };

  return {
    currentView,
    defaultEnd,
    defaultStart,
    defaultTitle,
    deleteAppointment,
    dialogOpen,
    editingId,
    events,
    isLoading,
    isMutationPending:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    closeDialog,
    onEventChange,
    onEventClick,
    onSelect,
    setCurrentView,
    submitAppointment,
  };
}
