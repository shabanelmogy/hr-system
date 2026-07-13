import { DateSelectArg, EventChangeArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useMemo, useState } from "react";
import { useAppointments, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from "../hooks/useAppointmentQueries";

// MUI
import { showToast } from "@/shared/components/common/feedback/Toast";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { alpha } from "@mui/material/styles";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

const todayStart = dayjs().startOf("day");

// Note: CSS imports are removed due to package exports. Add styles via CDN in index.html if needed.

// Attractive dialog for adding/editing an appointment
type AddAppointmentDialogProps = {
  open: boolean;
  loading?: boolean;
  mode?: "add" | "edit";
  defaultTitle?: string;
  defaultStart: string;
  defaultEnd: string;
  onClose: () => void;
  onSubmit: (data: { text: string; start: string; end: string }) => void;
  onDelete?: () => void;
};

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  open,
  loading,
  mode = "add",
  defaultTitle,
  defaultStart,
  defaultEnd,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [title, setTitle] = useState<string>("");
  const [start, setStart] = useState<Dayjs | null>(dayjs(defaultStart));
  const [end, setEnd] = useState<Dayjs | null>(dayjs(defaultEnd));
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  React.useEffect(() => {
    setTitle(defaultTitle || "");
    setStart(dayjs(defaultStart));
    setEnd(dayjs(defaultEnd));
    setErrors({});
  }, [defaultTitle, defaultStart, defaultEnd, open]);

  const validate = () => {
    const errs: { title?: string; time?: string } = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!start || !end) errs.time = "Start and End are required";
    else if (end.isBefore(start)) errs.time = "End must be after Start";
    else if (start.startOf("day").isBefore(todayStart)) errs.time = "Cannot create in past days";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      text: title.trim(),
      start: start!.format("YYYY-MM-DDTHH:mm"),
      end: end!.format("YYYY-MM-DDTHH:mm"),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <EventAvailableIcon color="primary" />
        <Typography variant="h6" component="div">{mode === "edit" ? "Edit Appointment" : "New Appointment"}</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Title"
            placeholder="What is this about?"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title || " "}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextFieldsIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <DateTimePicker
              label="Start"
              value={start}
              onChange={(v) => setStart(v ? dayjs(v) : null)}
              minDateTime={todayStart}
              ampm={false}
              format="DD/MM/YYYY HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
            <DateTimePicker
              label="End"
              value={end}
              onChange={(v) => setEnd(v ? dayjs(v) : null)}
              minDateTime={todayStart}
              ampm={false}
              format="DD/MM/YYYY HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Stack>

          {errors.time && (
            <Typography color="error" variant="body2">
              {errors.time}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {mode === "edit" && onDelete && (
          <Button color="error" onClick={onDelete} startIcon={<DeleteForeverIcon />} disabled={loading}>
            Delete
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit" disabled={loading} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={<SaveIcon />}>
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AppointmentCalendar: React.FC = () => {
  const { data: appointments = [], isLoading } = useAppointments();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStart, setDefaultStart] = useState<string>(new Date().toISOString());
  const [defaultEnd, setDefaultEnd] = useState<string>(new Date(Date.now() + 60 * 60 * 1000).toISOString());
  const [defaultTitle, setDefaultTitle] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<string>("dayGridMonth");

  const events = useMemo(() => {
    if (currentView === "dayGridMonth") {
      return appointments.map((a) => {
        // Derive date-only in UTC to avoid local timezone day shifts in month view
        const sUTC = new Date(a.start).toISOString().slice(0, 10); // YYYY-MM-DD
        const eUTC = new Date(a.end || a.start).toISOString().slice(0, 10);
        const sDay = dayjs(sUTC);
        const eDay = dayjs(eUTC);
        // Backend stores end as exclusive. Use as-is; ensure minimum 1 day span
        const endExclusive = eDay.isAfter(sDay)
          ? eDay.format("YYYY-MM-DD")
          : sDay.add(1, "day").format("YYYY-MM-DD");
        return {
          id: String(a.id),
          title: a.text,
          start: sUTC,
          end: endExclusive,
          allDay: true,
        };
      });
    }
    return appointments.map((a) => ({
      id: String(a.id),
      title: a.text,
      start: a.start,
      end: a.end,
    }));
  }, [appointments, currentView]);

  const onSelect = async (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const start = selectInfo.startStr;
    const isPast = dayjs(selectInfo.start).startOf("day").isBefore(todayStart);
    if (isPast) {
      showToast.warning("You cannot add appointments in previous days");
      return;
    }

    const end = selectInfo.endStr || new Date(selectInfo.start.getTime() + 60 * 60 * 1000).toISOString();
    const endForDialog = currentView === "dayGridMonth"
      ? dayjs(end).subtract(1, "day").format("YYYY-MM-DD")
      : end;

    setEditingId(null);
    setDefaultTitle("");
    setDefaultStart(start);
    setDefaultEnd(endForDialog);
    setDialogOpen(true);
  };

  const onCreate = (data: { text: string; start: string; end: string }) => {
    // Normalize create payload depending on view to avoid timezone day shifts
    if (currentView === "dayGridMonth") {
      const startDay = dayjs(data.start).format("YYYY-MM-DD");
      // Dialog shows inclusive end; convert to exclusive by adding 1 day
      const endDayExclusive = dayjs(data.end).add(1, "day").format("YYYY-MM-DD");
      // Save at UTC noon to avoid timezone-induced off-by-one day shifts
      createMutation.mutate(
        { start: `${startDay}T12:00:00Z`, end: `${endDayExclusive}T12:00:00Z`, text: data.text },
        {
          onSuccess: () => setDialogOpen(false),
          onError: (e: any) => showToast.error(e?.message || "Failed to create appointment"),
        }
      );
      return;
    }

    // Timed views: keep precise local date-time without timezone suffix
    createMutation.mutate(
      { start: dayjs(data.start).format("YYYY-MM-DDTHH:mm:ss"), end: dayjs(data.end).format("YYYY-MM-DDTHH:mm:ss"), text: data.text },
      {
        onSuccess: () => setDialogOpen(false),
        onError: (e: any) => showToast.error(e?.message || "Failed to create appointment"),
      }
    );
  };

  const onEdit = (data: { text: string; start: string; end: string }) => {
    if (editingId == null) return;

    if (currentView === "dayGridMonth") {
      const startDay = dayjs(data.start).format("YYYY-MM-DD");
      // Dialog shows inclusive end; convert to exclusive by adding 1 day
      const endDayExclusive = dayjs(data.end).add(1, "day").format("YYYY-MM-DD");
      updateMutation.mutate(
        { id: editingId, start: `${startDay}T12:00:00Z`, end: `${endDayExclusive}T12:00:00Z`, text: data.text },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingId(null);
          },
          onError: (e: any) => showToast.error(e?.message || "Failed to update appointment"),
        }
      );
      return;
    }

    updateMutation.mutate(
      {
        id: editingId,
        start: dayjs(data.start).format("YYYY-MM-DDTHH:mm:ss"),
        end: dayjs(data.end).format("YYYY-MM-DDTHH:mm:ss"),
        text: data.text,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingId(null);
        },
        onError: (e: any) => showToast.error(e?.message || "Failed to update appointment"),
      }
    );
  };

  const onDeleteEvent = () => {
    if (editingId == null) return;
    deleteMutation.mutate(editingId, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditingId(null);
      },
      onError: (e: any) => showToast.error(e?.message || "Failed to delete appointment"),
    });
  };

  const onEventChange = (changeInfo: EventChangeArg) => {
    const e = changeInfo.event;
    const id = Number(e.id);

    // In month view/all-day, use date-only semantics and save at UTC noon to avoid day shifts
    if (e.allDay || currentView === "dayGridMonth") {
      const startStr = e.startStr; // YYYY-MM-DD
      const endStr = e.endStr || e.startStr; // YYYY-MM-DD (exclusive end)
      // Backend expects exclusive end; validate using last included day (end - 1 day)
      const endMinusOne = dayjs(endStr).subtract(1, "day");

      const invalidAllDay = dayjs(startStr).isBefore(todayStart) || endMinusOne.isBefore(todayStart);
      if (invalidAllDay) {
        changeInfo.revert();
        return;
      }

      const startIsoUtcNoon = `${startStr}T12:00:00Z`;
      const endIsoUtcNoon = `${endStr}T12:00:00Z`;
      updateMutation.mutate({ id, start: startIsoUtcNoon, end: endIsoUtcNoon, text: e.title });
      return;
    }

    // Timed events in timeGrid views
    const startDate = e.start ? dayjs(e.start) : dayjs();
    const endDate = e.end ? dayjs(e.end) : startDate;
    const isInvalid = startDate.startOf("day").isBefore(todayStart) || endDate.startOf("day").isBefore(todayStart);
    if (isInvalid) {
      changeInfo.revert();
      return;
    }

    updateMutation.mutate({ id, start: startDate.toISOString(), end: endDate.toISOString(), text: e.title });
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    const id = Number(clickInfo.event.id);
    const isAllDay = clickInfo.event.allDay || currentView === "dayGridMonth";
    const start = isAllDay
      ? clickInfo.event.startStr
      : clickInfo.event.start?.toISOString() || new Date().toISOString();
    const end = isAllDay
      ? (clickInfo.event.endStr || clickInfo.event.startStr)
      : clickInfo.event.end?.toISOString() || start;
    const endForDialog = isAllDay
      ? dayjs(end).subtract(1, "day").format("YYYY-MM-DD")
      : end;

    setEditingId(id);
    setDefaultTitle(clickInfo.event.title);
    setDefaultStart(start);
    setDefaultEnd(endForDialog);
    setDialogOpen(true);
  };

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.9)
            : theme.palette.background.paper,
        borderRadius: 2,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.4)"
            : "0 2px 8px rgba(0,0,0,0.06)",

        "& .fc": {
          // FullCalendar CSS variables to adapt to MUI theme
          "--fc-page-bg-color": theme.palette.background.default,
          "--fc-page-text-color": theme.palette.text.primary,
          "--fc-neutral-bg-color": theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          "--fc-neutral-text-color": theme.palette.text.secondary,
          "--fc-border-color": theme.palette.divider,
          "--fc-list-event-hover-bg-color": alpha(theme.palette.primary.main, 0.1),
          "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.15),
          "--fc-event-bg-color": theme.palette.primary.main,
          "--fc-event-border-color": theme.palette.primary.dark,
          "--fc-event-text-color": theme.palette.primary.contrastText,
          "--fc-button-bg-color": theme.palette.primary.main,
          "--fc-button-border-color": theme.palette.primary.dark,
          "--fc-button-text-color": theme.palette.primary.contrastText,
          "--fc-button-hover-bg-color": theme.palette.primary.dark,
          "--fc-button-active-bg-color": theme.palette.primary.dark,
          fontFamily: theme.typography.fontFamily,
        },

        // Toolbar and title
        "& .fc .fc-toolbar": {
          gap: 8,
        },
        "& .fc .fc-toolbar-title": {
          color: (theme.palette.text as any).primary,
          fontWeight: 700,
        },

        // Button enhancements (month/week/day/list + prev/next + today)
        "& .fc .fc-button": {
          textTransform: "none",
          borderRadius: 1.5,
          boxShadow: "none",
          backgroundColor: "transparent",
          color: (theme.palette.text as any).secondary,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          transition: "all .2s ease",
          fontWeight: 600,
        },
        "& .fc .fc-button:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          color: theme.palette.primary.main,
          borderColor: alpha(theme.palette.primary.main, 0.6),
        },
        "& .fc .fc-button.fc-button-active, & .fc .fc-button[aria-pressed=\"true\"]": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderColor: theme.palette.primary.dark,
        },
        "& .fc .fc-today-button": {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          borderColor: theme.palette.secondary.dark,
        },
        "& .fc .fc-today-button:hover": {
          backgroundColor: theme.palette.secondary.dark,
          borderColor: theme.palette.secondary.dark,
        },
        "& .fc .fc-button.fc-button-disabled, & .fc .fc-today-button.fc-button-disabled": {
          opacity: 0.6,
          backgroundColor: alpha(theme.palette.action.disabledBackground || theme.palette.divider, 0.08),
          color: theme.palette.text.disabled,
          borderColor: alpha(theme.palette.divider, 0.4),
        },
        "& .fc .fc-prev-button, & .fc .fc-next-button": {
          backgroundColor: "transparent",
          color: (theme.palette.text as any).secondary,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        },
        "& .fc .fc-prev-button:hover, & .fc .fc-next-button:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          color: theme.palette.primary.main,
          borderColor: alpha(theme.palette.primary.main, 0.6),
        },

        // Header and grid colors
        "& .fc .fc-col-header": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.common.white, 0.02)
              : alpha(theme.palette.primary.main, 0.04),
        },
        "& .fc .fc-col-header-cell-cushion": {
          color: (theme.palette.text as any).secondary,
        },
        "& .fc .fc-daygrid-day-number": {
          color: (theme.palette.text as any).secondary,
        },
        "& .fc .fc-scrollgrid": {
          borderColor: theme.palette.divider,
          backgroundColor: "transparent",
          borderRadius: 1.5,
        },
        "& .fc .fc-timegrid-slot": {
          borderColor: theme.palette.divider,
        },
        "& .fc .fc-day-today": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
        "& .fc .fc-list": {
          backgroundColor: "transparent",
        },
      })}
    >
      {isLoading ? (
        <div>Loading calendar...</div>
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            selectable
            selectMirror
            editable
            eventStartEditable={true}
            eventDurationEditable={true}
            eventResizableFromStart={true}
            eventDisplay="block"
            events={events}
            select={onSelect}
            eventClick={onEventClick}
            eventChange={onEventChange}
            datesSet={(arg) => setCurrentView(arg.view.type)}
            height="auto"
          />

          <AddAppointmentDialog
            open={dialogOpen}
            loading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
            mode={editingId ? "edit" : "add"}
            defaultTitle={defaultTitle}
            defaultStart={defaultStart}
            defaultEnd={defaultEnd}
            onClose={() => {
              setDialogOpen(false);
              setEditingId(null);
            }}
            onSubmit={(data) => (editingId ? onEdit(data) : onCreate(data))}
            onDelete={editingId ? onDeleteEvent : undefined}
          />
        </>
      )}
    </Box>
  );
};

export default AppointmentCalendar;
