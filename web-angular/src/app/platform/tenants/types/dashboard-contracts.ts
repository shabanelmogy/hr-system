import * as z from 'zod/mini';
export const subscriptionStatuses=['free','trial','active','pastDue','suspended','expired','cancelled'] as const;
export type SubscriptionStatus=typeof subscriptionStatuses[number];
const count=z.int().check(z.gte(0));
const date=z.string().check(z.refine(value=>Number.isFinite(Date.parse(value))));
const summarySchema=z.object({
  totalTenants:count,enabledTenants:count,admins:count,users:count,companies:count,maxAdmins:count,maxUsers:count,expiringWithin30Days:count,
  subscriptionStatusCounts:z.object({free:count,trial:count,active:count,pastDue:count,suspended:count,expired:count,cancelled:count}),
  recentTenants:z.array(z.object({id:z.string(),identifier:z.string(),name:z.string(),subscriptionStatus:z.enum(subscriptionStatuses)})),
  expiringWithin30DaysTenants:z.array(z.object({id:z.string(),name:z.string(),planName:z.nullable(z.string()),subscriptionEndsOn:date})),
});
export type DashboardSummary=z.infer<typeof summarySchema>;
export function parseDashboardSummary(value:unknown):DashboardSummary{
  const summary=summarySchema.parse(value);
  for(const list of [summary.recentTenants,summary.expiringWithin30DaysTenants]){
    if(list.some(row=>!row.id.trim())||new Set(list.map(row=>row.id)).size!==list.length)throw new Error('Invalid dashboard list identity.');
  }
  return summary;
}
