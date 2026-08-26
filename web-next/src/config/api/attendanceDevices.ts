import { version } from "./constants";
import type { Id } from "./types";

const devices = `${version}/attendance-devices`;

export const attendanceDevices = {
  page: devices,
  create: devices,
  getById: (id: Id) => `${devices}/${id}`,
  update: (id: Id) => `${devices}/${id}`,
  enabled: (id: Id) => `${devices}/${id}/enabled`,
  credentials: (id: Id) => `${devices}/${id}/credentials`,
  providers: `${devices}/providers`,
  branches: `${devices}/branches`,
  agents: `${devices}/agents`,
  connectorHealth: `${devices}/connector/health`,
  detect: `${devices}/detect`,
  test: (id: Id) => `${devices}/${id}/test`,
  pullUsers: (id: Id) => `${devices}/${id}/pull-users`,
  pullAttendance: (id: Id) => `${devices}/${id}/pull-attendance`,
  users: `${version}/attendance-device-users`,
  punches: `${version}/raw-attendance-punches`,
  pullRuns: `${version}/device-pull-runs`,
} as const;
