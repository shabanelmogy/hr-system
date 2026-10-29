import type { SubscriptionStatus } from '../types/dashboard-contracts';
export function daysRemaining(value:string,now=Date.now()):number{return Math.max(0,Math.ceil((Date.parse(value)-now)/86_400_000));}
export function statusAccent(status:SubscriptionStatus):string{
  return status==='active'?'var(--primary)':status==='trial'?'var(--info)':status==='pastDue'?'var(--warning)':status==='free'?'var(--muted-foreground)':'var(--destructive)';
}
