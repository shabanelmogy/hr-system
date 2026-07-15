import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box } from "@mui/material";
import { useAppointmentCalendar } from "../hooks/useAppointmentCalendar";
import AppointmentDialog from "./AppointmentDialog";
import { appointmentCalendarStyles } from "./appointmentCalendarStyles";

export default function AppointmentCalendar() {
  const calendar = useAppointmentCalendar();

  return (
    <Box sx={appointmentCalendarStyles}>
      {calendar.isLoading ? (
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
            eventStartEditable
            eventDurationEditable
            eventResizableFromStart
            eventDisplay="block"
            events={calendar.events}
            select={calendar.onSelect}
            eventClick={calendar.onEventClick}
            eventChange={calendar.onEventChange}
            datesSet={(arg) => calendar.setCurrentView(arg.view.type)}
            height="auto"
          />

          {calendar.dialogOpen && (
            <AppointmentDialog
              open
              loading={calendar.isMutationPending}
              mode={calendar.editingId == null ? "add" : "edit"}
              defaultTitle={calendar.defaultTitle}
              defaultStart={calendar.defaultStart}
              defaultEnd={calendar.defaultEnd}
              inclusiveEnd={calendar.currentView === "dayGridMonth"}
              onClose={calendar.closeDialog}
              onSubmit={calendar.submitAppointment}
              onDelete={calendar.editingId == null ? undefined : calendar.deleteAppointment}
            />
          )}
        </>
      )}
    </Box>
  );
}
