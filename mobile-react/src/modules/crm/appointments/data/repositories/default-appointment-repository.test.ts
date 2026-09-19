import type { AppointmentInput } from '../../domain/models/appointment';
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository';
import { DefaultAppointmentRepository } from './default-appointment-repository';

describe('CRM appointment repository', () => {
  it('delegates online-authoritative writes to its remote port', async () => {
    const saved: AppointmentInput[] = [];
    const deleted: number[] = [];
    const appointment = {
      id: 3,
      start: '2026-09-10T08:00:00.000Z',
      end: '2026-09-10T09:00:00.000Z',
      text: 'Review',
      isAllDay: false,
    };
    const remote: AppointmentRepository = {
      getAppointments: async () => [],
      saveAppointment: async (input) => { saved.push(input); return appointment; },
      deleteAppointment: async (id) => { deleted.push(id); },
    };
    const repository = new DefaultAppointmentRepository(remote);
    const input: AppointmentInput = { ...appointment, id: undefined };

    await repository.saveAppointment(input);
    await repository.deleteAppointment(3);

    expect(saved).toEqual([input]);
    expect(deleted).toEqual([3]);
  });
});
