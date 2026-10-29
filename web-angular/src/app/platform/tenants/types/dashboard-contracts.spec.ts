import { dashboardFixture } from '../dashboard.fixture';
import { daysRemaining } from '../presentation/dashboard-utils';
import { parseDashboardSummary } from './dashboard-contracts';
describe('Tenant summary contract',()=>{
  it('preserves server counts/statuses/bounded rows without reconstructing an aggregate',()=>{
    const result=parseDashboardSummary(dashboardFixture);expect(result.totalTenants).toBe(20);expect(result.recentTenants).toHaveLength(8);expect(result.users).toBe(80);
  });
  it('rejects malformed counts, statuses, dates and duplicate list identities',()=>{
    for(const value of [null,{}, {...dashboardFixture,users:-1},{...dashboardFixture,companies:1.5},
      {...dashboardFixture,recentTenants:[{...dashboardFixture.recentTenants[0],subscriptionStatus:'unknown'}]},
      {...dashboardFixture,expiringWithin30DaysTenants:[{...dashboardFixture.expiringWithin30DaysTenants[0],subscriptionEndsOn:'invalid'}]},
      {...dashboardFixture,recentTenants:[dashboardFixture.recentTenants[0],dashboardFixture.recentTenants[0]]}])expect(()=>parseDashboardSummary(value)).toThrow();
  });
  it('accepts actual zero/empty data and clamps expired day counts without changing the server status',()=>{
    expect(parseDashboardSummary({...dashboardFixture,totalTenants:0,recentTenants:[],expiringWithin30DaysTenants:[]}).totalTenants).toBe(0);
    const now=Date.parse('2026-10-29T12:00:00Z');expect(daysRemaining('2026-10-28T00:00:00Z',now)).toBe(0);expect(daysRemaining('2026-10-30T12:00:01Z',now)).toBe(2);
  });
});
