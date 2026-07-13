import React from "react";
import AppointmentCalendar from "../components/AppointmentCalendar";

const AppointmentsPage: React.FC = () => {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 8 }}>
      <AppointmentCalendar />
    </div>
  );
};

export default AppointmentsPage;
