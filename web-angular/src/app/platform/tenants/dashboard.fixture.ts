import type { DashboardSummary } from './types/dashboard-contracts';
export const dashboardFixture:DashboardSummary={
  totalTenants:20,enabledTenants:18,admins:8,users:80,companies:25,maxAdmins:60,maxUsers:500,expiringWithin30Days:8,
  subscriptionStatusCounts:{free:2,trial:8,active:8,pastDue:0,suspended:1,expired:1,cancelled:0},
  recentTenants:Array.from({length:8},(_,i)=>({id:'fixture-'+i,identifier:'TENANT-'+i,name:'منشأة اختبار طويلة الاسم — Tenant '+i,subscriptionStatus:i%2?'trial':'active'})),
  expiringWithin30DaysTenants:Array.from({length:8},(_,i)=>({id:'expiring-'+i,name:'المنشأة التجريبية — Tenant '+i,planName:i%2?'Business':null,subscriptionEndsOn:new Date(Date.now()+(i+1)*2*86_400_000).toISOString()})),
};
