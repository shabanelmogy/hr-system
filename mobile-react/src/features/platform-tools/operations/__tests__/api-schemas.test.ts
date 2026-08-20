import { backgroundJobDashboardSchema, healthCheckSchema } from '../api-schemas';

describe('operations response schemas', () => {
  it('accepts canonical health and background-job responses', () => {
    const health = {
      status: 'Healthy' as const,
      totalDuration: '00:00:00.001',
      entries: {
        database: {
          status: 'Healthy' as const,
          duration: '00:00:00.001',
          description: null,
        },
      },
    };
    const jobs = {
      servers: 1,
      queues: 2,
      enqueued: 3,
      scheduled: 4,
      processing: 5,
      succeeded: 6,
      failed: 0,
      generatedAt: '2026-08-20T10:00:00Z',
    };

    expect(healthCheckSchema.parse(health)).toEqual(health);
    expect(backgroundJobDashboardSchema.parse(jobs)).toEqual(jobs);
  });

  it('rejects an incomplete health-check entry', () => {
    expect(healthCheckSchema.safeParse({
      status: 'Healthy',
      totalDuration: '00:00:00.001',
      entries: { database: { status: 'Healthy', duration: '00:00:00.001' } },
    }).success).toBe(false);
  });

  it('rejects negative background-job counts', () => {
    expect(backgroundJobDashboardSchema.safeParse({
      servers: 1,
      queues: 1,
      enqueued: -1,
      scheduled: 0,
      processing: 0,
      succeeded: 0,
      failed: 0,
      generatedAt: '2026-08-20T10:00:00Z',
    }).success).toBe(false);
  });
});
