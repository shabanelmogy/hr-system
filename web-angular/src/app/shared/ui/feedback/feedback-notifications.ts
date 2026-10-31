import { Injectable,signal } from '@angular/core';
export interface FeedbackNotice {readonly id:number;readonly key:string;readonly namespace:string;readonly params:Readonly<Record<string,string|number>>;readonly titleKey?:string;}
/** Queue before lazy hosts load; features supply translated keys, never raw HTML. */
@Injectable({providedIn:'root'})
export class FeedbackNotifications {
 private serial=0;private readonly successQueue=signal<readonly FeedbackNotice[]>([]);private readonly errorNotice=signal<FeedbackNotice|null>(null);
 readonly toasts=this.successQueue.asReadonly();readonly error=this.errorNotice.asReadonly();
 success(key:string,namespace='core',params:Readonly<Record<string,string|number>>={}):void{this.successQueue.update(queue=>[...queue,{id:++this.serial,key,namespace,params}]);}
 delivered(ids:readonly number[]):void{this.successQueue.update(queue=>queue.filter(notice=>!ids.includes(notice.id)));}
 failure(key:string,namespace='core',params:Readonly<Record<string,string|number>>={},titleKey='errorDialog.title'):void{this.errorNotice.set({id:++this.serial,key,namespace,params,titleKey});}
 dismissError():void{this.errorNotice.set(null);}
}
