import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import arLocale from "@fullcalendar/react/locales/ar";
import enGbLocale from "@fullcalendar/react/locales/en-gb";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import { ErrorOutlineOutlined as ErrorOutlineIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { Box, Button, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FeedbackState } from "@/shared/components/feedback/states";
import { MySimpleLoader } from "@/shared/components/loaders";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAppointmentCalendar } from "../../hooks/useAppointmentCalendar";
import AppointmentDialog from "../dialogs/AppointmentDialog";
import { appointmentCalendarStyles } from "./appointmentCalendarStyles";

const calendarPlugins = [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
  classicThemePlugin,
];

export default function AppointmentCalendar() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const authorization = usePermissions();
  const access = {
    canView: authorization.hasPermission(permissions.ViewAppointments),
    canCreate: !authorization.isReadOnly && authorization.hasPermission(permissions.CreateAppointments),
    canEdit: !authorization.isReadOnly && authorization.hasPermission(permissions.EditAppointments),
    canDelete: !authorization.isReadOnly && authorization.hasPermission(permissions.DeleteAppointments),
  };
  const calendar = useAppointmentCalendar(access);
  const isArabic = i18n.resolvedLanguage?.startsWith("ar") ?? false;

  if (calendar.isLoading) {
    return <MySimpleLoader label={t("appointments.loading")} />;
  }

  if (calendar.isError) {
    return (
      <FeedbackState
        role="alert"
        icon={<ErrorOutlineIcon color="error" />}
        title={t("appointments.loadErrorTitle")}
        description={t("appointments.loadErrorDescription")}
        actions={
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => void calendar.refetch()}
          >
            {t("appointments.retry")}
          </Button>
        }
      />
    );
  }

  return (
    <Box aria-busy={calendar.isMutationPending} sx={appointmentCalendarStyles}>
      <FullCalendar
        plugins={calendarPlugins}
        initialView="dayGridMonth"
        locale={isArabic ? arLocale : enGbLocale}
        direction={theme.direction}
        toolbarClass="erp-calendar-toolbar"
        toolbarSectionClass="erp-calendar-toolbar-section"
        toolbarTitleClass="erp-calendar-toolbar-title"
        buttonClass="erp-calendar-button"
        tableClass="erp-calendar-table"
        viewClass="erp-calendar-view"
        dayHeaderClass="erp-calendar-day-header"
        dayHeaderInnerClass="erp-calendar-day-header-inner"
        dayCellClass={(info) =>
          info.isToday ? "erp-calendar-day erp-calendar-day-today" : "erp-calendar-day"
        }
        dayCellTopInnerClass="erp-calendar-day-number"
        slotLaneClass="erp-calendar-slot"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        selectable={access.canCreate}
        selectMirror
        editable={access.canEdit}
        eventStartEditable={access.canEdit}
        eventDurationEditable={access.canEdit}
        eventResizableFromStart={access.canEdit}
        eventDisplay="block"
        events={calendar.events}
        select={access.canCreate ? calendar.onSelect : undefined}
        eventClick={access.canView ? calendar.onEventClick : undefined}
        eventDrop={access.canEdit ? (event) => void calendar.onEventDrop(event) : undefined}
        eventResize={access.canEdit ? (event) => void calendar.onEventResize(event) : undefined}
        datesSet={calendar.onDatesSet}
        height="auto"
      />

      {calendar.dialogOpen && (
        <AppointmentDialog
          open
          loading={calendar.isMutationPending}
          mode={calendar.editingId == null ? "add" : access.canEdit ? "edit" : "view"}
          defaultValues={calendar.formDefaults}
          onClose={calendar.closeDialog}
          onSubmit={calendar.submitAppointment}
          onDelete={calendar.editingId == null || !access.canDelete ? undefined : calendar.deleteAppointment}
        />
      )}
    </Box>
  );
}
