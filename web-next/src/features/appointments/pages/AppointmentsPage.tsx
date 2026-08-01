"use client";

import { Box } from "@mui/material";
import AppointmentCalendar from "../components/calendar/AppointmentCalendar";

const AppointmentsPage = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 1 }}>
      <AppointmentCalendar />
    </Box>
  );
};

export default AppointmentsPage;
