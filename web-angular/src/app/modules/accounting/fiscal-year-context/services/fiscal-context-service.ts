import { inject,Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom,map,timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import { parseFiscalContext } from '../types/fiscal-context';
@Injectable({providedIn:'root'})
export class FiscalContextService {
  private readonly http=inject(HttpClient);private readonly auth=inject(BrowserMutationSecurity);
  private readonly url=inject(ERP_API_ORIGIN)+'/api/v1/fiscal-years/context';
  read(){return this.http.get<unknown>(this.url,{withCredentials:true}).pipe(timeout(10_000),map(parseFiscalContext));}
  async select(fiscalYearId:number){const token=await this.auth.csrf();return firstValueFrom(this.http.put<unknown>(this.url,{fiscalYearId},{withCredentials:true,headers:{'X-ERP-XSRF':token}}).pipe(timeout(10_000),map(parseFiscalContext)));}
}
