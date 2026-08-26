import type { Metadata } from "next";
import { AttendanceDevicesPage } from "@/features/attendance-devices";
export const metadata: Metadata = { title: "Attendance Devices | HR Management System" };
export default function Page() { return <AttendanceDevicesPage />; }
