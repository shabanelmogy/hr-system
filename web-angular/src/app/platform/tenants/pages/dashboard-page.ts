import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, from, map, of, timeout } from 'rxjs';
import { FeedbackState, MetricCard, PageHeader, ProgressMeter, StatusBadge, SurfaceCard } from '../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../localization/public-api';
import { ThemeService } from '../../../../theme/public-api';
import { DashboardState } from '../state/dashboard-state';
import { subscriptionStatuses } from '../types/dashboard-contracts';
import { daysRemaining, statusAccent } from '../presentation/dashboard-utils';
@Component({imports:[FeedbackState,MetricCard,PageHeader,ProgressMeter,StatusBadge,SurfaceCard,UiTextPipe],providers:[DashboardState],templateUrl:'./dashboard-page.html',styleUrl:'./dashboard-page.scss'})
export class DashboardPage {
  readonly dashboard=inject(DashboardState);readonly locale=inject(LocalizationRuntime);private readonly theme=inject(ThemeService);
  readonly statuses=subscriptionStatuses;readonly statusAccent=statusAccent;
  readonly secondaryAccent=computed(()=>this.theme.theme().colors.brand2);
  readonly captions=toSignal(from(Promise.all([this.locale.loadNamespace('core'),this.locale.loadNamespace('platform-tenants')])).pipe(timeout(10_000),map(():'loading'|'ready'|'error'=>'ready'),catchError(()=>of('error' as const))),{initialValue:'loading' as const});
  readonly metrics=computed(()=>{const s=this.dashboard.state();if(s.kind!=='ready')return [];const c=this.theme.theme();return [
    {key:'totalTenants',value:s.data.totalTenants,accent:c.colors.primary,icon:'company' as const},
    {key:'enabledTenants',value:s.data.enabledTenants,accent:c.colors.success,icon:'check' as const},
    {key:'totalAdmins',value:s.data.admins,accent:c.colors.brand2,icon:'admin' as const},
    {key:'totalUsers',value:s.data.users,accent:c.modules.crm,icon:'user' as const},
    {key:'totalCompanies',value:s.data.companies,accent:c.modules.referenceData,icon:'building' as const},
    {key:'expiringSoon',value:s.data.expiringWithin30Days,accent:c.colors.warning,icon:'calendar' as const},
  ];});
  number(value:number):string{return new Intl.NumberFormat(this.locale.language()).format(value);}
  date(value:string):string{return new Intl.DateTimeFormat(this.locale.language(),{dateStyle:'medium'}).format(new Date(value));}
  seats(used:number,limit:number):string{return this.locale.translate('superAdminDashboard.seatsUsed','platform-tenants',{used,limit});}
  remaining(value:string):string{return this.locale.translate('superAdminDashboard.daysRemaining','platform-tenants',{count:daysRemaining(value)});}
}
