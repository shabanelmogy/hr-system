import { appointmentEndpoints } from './appointment-endpoints';
import { appointmentSchema } from './appointment-schemas';

describe('appointments remote boundary', () => {
  it('preserves appointment endpoint routes', () => {
    expect(appointmentEndpoints.getAll).toBe('appointments/getAll');
    expect(appointmentEndpoints.add).toBe('appointments/add');
    expect(appointmentEndpoints.update).toBe('appointments/update');
    expect(appointmentEndpoints.delete(12)).toBe('appointments/delete?id=12');
  });

  it('accepts the canonical appointment response', () => {
    expect(appointmentSchema.parse({
      id: 12,
      start: '2026-08-20T10:00:00+00:00',
      end: '2026-08-20T10:30:00+00:00',
      text: 'Review',
      isAllDay: false,
    })).toMatchObject({ id: 12, text: 'Review' });
    expect(appointmentSchema.safeParse({ id: 0 }).success).toBe(false);
  });
});
