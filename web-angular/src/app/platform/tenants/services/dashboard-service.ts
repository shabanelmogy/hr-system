import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { parseDashboardSummary } from '../types/dashboard-contracts';
@Injectable({providedIn:'root'})
export class DashboardService {
  private readonly http=inject(HttpClient);private readonly origin=inject(ERP_API_ORIGIN);
  constructor(){const url=new URL(this.origin);if(url.protocol!=='https:'||url.origin!==this.origin)throw new Error('An exact HTTPS API origin is required.');}
  summary(){return this.http.get<unknown>(this.origin+'/api/v1/tenants/getDashboardSummary',{withCredentials:true}).pipe(timeout(10_000),map(parseDashboardSummary));}
}
