import type { Metadata } from "next";
import { AttendanceDevicesPage } from "@/modules/hr/attendance-devices";
export const metadata: Metadata = { title: "Attendance Devices | ERP System" };
export default function Page() { return <AttendanceDevicesPage />; }
