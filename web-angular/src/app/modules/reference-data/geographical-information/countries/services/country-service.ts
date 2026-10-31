import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError,defer,from,map,switchMap,throwError,timeout } from 'rxjs';
import { classifyCommandFailure } from '../../../../../shared/data/public-api';
import { BrowserMutationSecurity } from '../../../../../platform/auth/session.public-api';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { countryDetailSchema, countryQueryParameters, parseCountryId, parseCountryPage, type CountryQuery } from '../types/country';
import { countryMutationFields,parseCountryMutation,type CountryDraft } from '../validation/country-mutation';
import { parseCountryBatch,parseArchivedCount,type CountryLifecycleAction } from '../types/country-lifecycle';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security=inject(BrowserMutationSecurity);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin) throw new Error('An exact HTTPS API origin is required.');
  }
  page(input: CountryQuery) {
    return defer(() => {
      const { query, params } = countryQueryParameters(input);
      const legacy=legacyFilterParameters(query,params);
      const read=legacy?this.http.get<unknown>(this.origin+'/api/v1/countries',{withCredentials:true,params:legacy}):
        from(this.security.csrf()).pipe(switchMap(token=>this.http.post<unknown>(this.origin+'/api/v1/countries/query',query,{withCredentials:true,headers:{'X-ERP-XSRF':token}})));
      return read
        .pipe(timeout(10000), map(value => parseCountryPage(value, query)));
    });
  }
  create(input:CountryDraft){return this.write(input,null);}
  update(id:number,input:CountryDraft){return this.write(input,id);}
  archive(id:number){return this.lifecycle('archive',[id]);}
  restore(id:number){return this.lifecycle('restore',[id]);}
  bulkArchive(ids:readonly number[]){return this.lifecycle('bulk',ids);}
  private lifecycle(action:CountryLifecycleAction,input:readonly number[]){
    return defer(()=>{
      let dispatched=false;
      return defer(()=>{
        const ids=parseCountryBatch(input),url=this.origin+'/api/v1/countries';
        return from(this.security.csrf()).pipe(switchMap(token=>{
          dispatched=true;const options={withCredentials:true,headers:{'X-ERP-XSRF':token},observe:'response' as const};
          return action==='archive'?this.http.delete<unknown>(url+'/'+ids[0],options):this.http.post<unknown>(action==='restore'?url+'/'+ids[0]+'/restore':url+'/bulk-archive',action==='bulk'?{ids}:null,options);
        }),timeout(10000),map(response=>{
          if(action==='bulk')return parseArchivedCount(response.body,ids.length);
          if(response.status!==204)throw Error('Invalid lifecycle response');
          return 1;
        }));
      }).pipe(catchError((error:unknown)=>throwError(()=>classifyCommandFailure(error,dispatched))));
    });
  }
  private write(input:CountryDraft,inputId:number|null){
    return defer(()=>{
      let dispatched=false;
      return defer(()=>{
        const mutation=parseCountryMutation(input),id=inputId===null?null:parseCountryId(inputId);
        return from(this.security.csrf()).pipe(switchMap(token=>{
          dispatched=true;
          const options={withCredentials:true,headers:{'X-ERP-XSRF':token}};
          return id===null?this.http.post<unknown>(this.origin+'/api/v1/countries',mutation,options):this.http.put<unknown>(this.origin+'/api/v1/countries/'+id,mutation,options);
        }),timeout(10000),map(value=>{
          const result=countryDetailSchema.parse(value);
          if(result.isDeleted||id!==null&&result.id!==id)throw Error('Invalid command result');
          return result;
        }));
      }).pipe(catchError((error:unknown)=>throwError(()=>classifyCommandFailure(error,dispatched,countryMutationFields))));
    });
  }
  detail(input: number) {
    return defer(() => {
      const id = parseCountryId(input);
      return this.http.get<unknown>(this.origin + '/api/v1/countries/' + id, { withCredentials: true })
        .pipe(timeout(10000), map(value => {
          const detail = countryDetailSchema.parse(value);
          if (detail.id !== id) throw new Error('Invalid Country detail identity');
          return detail;
        }));
    });
  }
}

/** Use the old endpoint only when the complete structured criterion is exactly equivalent. */
function legacyFilterParameters(query:CountryQuery,params:Record<string,string>):Record<string,string>|null{
 if(!query.filters?.length)return params;
 if(query.search||query.filters.length!==1)return null;const group=query.filters[0],rule=group.constraints[0];
 if(group.constraints.length!==1||typeof rule.value!=='string'||!['nameAr','nameEn','alpha2Code','alpha3Code','phoneCode','currencyCode'].includes(group.field))return null;
 const modes:Readonly<Record<string,string>>={contains:'contains',notContains:'doesNotContain',equals:'equals',notEquals:'doesNotEqual',startsWith:'startsWith',endsWith:'endsWith'};
 const operator=modes[rule.matchMode];return operator?{...params,search:rule.value.trim(),searchField:group.field,searchOperator:operator}:null;
}
