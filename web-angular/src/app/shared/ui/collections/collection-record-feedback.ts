import { Injectable,signal } from '@angular/core';
import type { CollectionId,CollectionQuery,CollectionSource } from './collection.types';

export interface CollectionRecordRequest {
 readonly query:CollectionQuery;readonly sequence:number;readonly issuedAt:number;
 readonly target:{readonly id:CollectionId}|{readonly index:number};readonly flash:'edited'|null;
}
const handled=new WeakSet<CollectionRecordRequest>();
export const recordRequestHandled=(request:CollectionRecordRequest)=>handled.has(request);
export const consumeRecordRequest=(request:CollectionRecordRequest):void=>{handled.add(request);};
export const recordFlashDuration=2400;

/** Provide per collection page. This service owns presentation intent, never business writes. */
@Injectable()
export class CollectionRecordFeedback {
 private sequence=0;private readonly current=signal<CollectionRecordRequest|null>(null);
 readonly request=this.current.asReadonly();
 edited<T>(source:CollectionSource<T>,id:CollectionId):void{this.publish(source.query,{id},'edited');}
 removed<T>(source:CollectionSource<T>,rowId:(row:T)=>CollectionId,ids:readonly CollectionId[]):void{
  const rows=source.result?.rows??[],first=rows.findIndex(row=>ids.includes(rowId(row)));
  if(first<0)return;
  this.publish(source.query,{index:Math.max(0,source.query.pageIndex*source.query.pageSize+first-1)},null);
 }
 private publish(query:CollectionQuery,target:CollectionRecordRequest['target'],flash:CollectionRecordRequest['flash']):void{
  this.current.set(Object.freeze({query:Object.freeze({...query}),target:Object.freeze(target),flash,sequence:++this.sequence,issuedAt:Date.now()}));
 }
}
