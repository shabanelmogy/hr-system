import { inject, Injectable } from '@angular/core';
import { createScopedRead } from '../../../shared/data/public-api';
import { AuthSession } from '../../auth/session.public-api';
import { DashboardService } from '../services/dashboard-service';
export const globalAdministrator=(user:{readonly roles:readonly string[]})=>user.roles.some(role=>role.trim().toLowerCase()==='super_admin');
@Injectable()
export class DashboardState {
  private readonly service=inject(DashboardService);
  private readonly read=createScopedRead(inject(AuthSession).readIdentity,globalAdministrator,()=>this.service.summary());
  readonly state=this.read.state;
  retry():void{this.read.retry();}
}
