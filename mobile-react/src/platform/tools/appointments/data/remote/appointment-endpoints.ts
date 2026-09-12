export const appointmentEndpoints = {
  getAll: 'appointments/getAll',
  add: 'appointments/add',
  update: 'appointments/update',
  delete: (id: number) => `appointments/delete?id=${id}`,
} as const;
