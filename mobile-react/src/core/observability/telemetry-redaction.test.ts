import { sanitizeTelemetryAttributes } from './telemetry-redaction';

describe('telemetry redaction', () => {
  it('drops secrets and business payload values before dispatch', () => {
    expect(sanitizeTelemetryAttributes({
      route: '/finance', status: 500, token: 'secret', annualSalary: 1200,
      payload: { employee: 'private' }, correlationId: 'abc',
    })).toEqual({ route: '/finance', status: 500, correlationId: 'abc' });
  });
});
