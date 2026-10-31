import { computed,DestroyRef,effect,inject,Injectable,signal,untracked } from '@angular/core';
import { Subscription,take,throwIfEmpty } from 'rxjs';
import { AuthSession,type Session } from '../../../../../platform/auth/session.public-api';
import { CommandFailure,UnsavedChanges } from '../../../../../shared/data/public-api';
import { CollectionRecordFeedback,FeedbackNotifications,type CollectionId,type CollectionSource } from '../../../../../shared/ui/public-api';
import { CountryService } from '../services/country-service';
import { countryWriteAllowed } from '../types/country-actions';
import { countryLifecycleError,type CountryLifecycleAction } from '../types/country-lifecycle';
import type { CountryListItem } from '../types/country';
import { CountryReadState } from './country-read-state';
import { CountryEditorState } from './country-editor-state';

interface Confirmation {
 readonly actor:Session;readonly serial:number;readonly action:CountryLifecycleAction;
 readonly source:CollectionSource<CountryListItem>;readonly rows:readonly CountryListItem[];
}
@Injectable()
export class CountryLifecycleState {
 private readonly auth=inject(AuthSession);private readonly reads=inject(CountryReadState);private readonly editor=inject(CountryEditorState);
 private readonly records=inject(CollectionRecordFeedback);private readonly service=inject(CountryService);private readonly notices=inject(FeedbackNotifications);private readonly drafts=inject(UnsavedChanges);private readonly destroy=inject(DestroyRef);
 private readonly entry=signal<Confirmation|null>(null);private serial=0;private operation:Subscription|null=null;
 private readonly deniedActor=signal<Session|null>(null);
 private readonly selection=signal<{source:CollectionSource<CountryListItem>;ids:readonly number[]}|null>(null);
 readonly pending=signal(false);
 readonly allowed=computed(()=>countryWriteAllowed(this.auth.readIdentity(),'Archive')&&this.auth.readIdentity()!==this.deniedActor()&&!this.editor.active());
 readonly selected=computed(()=>{
  const selection=this.selection(),source=this.reads.source();
  if(!this.allowed()||!selection||selection.source!==source||source.kind!=='ready')return [];
  return selection.ids.filter(id=>(source.result?.rows??[]).some(row=>row.id===id&&!row.isDeleted));
 });
 readonly open=computed(()=>{const entry=this.entry();return!!entry&&this.authorized(entry);});
 readonly action=computed(()=>this.entry()?.action??'archive');readonly targets=computed(()=>this.open()?this.entry()!.rows:[]);
 readonly count=computed(()=>this.targets().length);
 readonly selectable=(row:CountryListItem)=>this.allowed()&&!row.isDeleted;
 constructor(){
  const unregister=this.drafts.register({read:()=>({identity:'countries-lifecycle:'+(this.entry()?.serial??0),revision:0,active:this.open(),unsaved:false,pending:this.pending()}),invalidate:()=>this.invalidate()});
  effect(()=>{
   const entry=this.entry(),source=this.reads.source();
   if(entry&&(!this.authorized(entry)||!this.pending()&&entry.source!==source))untracked(()=>this.invalidate());
   const selection=this.selection();if(selection&&(selection.source!==source||!this.allowed()))untracked(()=>this.selection.set(null));
  });
  this.destroy.onDestroy(()=>{unregister();this.operation?.unsubscribe();});
 }
 private authorized(entry:Confirmation):boolean{
  return entry.actor===this.auth.readIdentity()&&entry.actor!==this.deniedActor()&&countryWriteAllowed(entry.actor,entry.action==='restore'?'Restore':'Archive')&&!this.editor.active();
 }
 can(row:CountryListItem,action:'archive'|'restore'):boolean{
  const source=this.reads.source(),actor=this.auth.readIdentity();
  return !this.pending()&&!this.editor.active()&&actor!==this.deniedActor()&&countryWriteAllowed(actor,action==='restore'?'Restore':'Archive')&&source.kind==='ready'&&(source.result?.rows??[]).some(current=>current.id===row.id&&current.isDeleted===(action==='restore'));
 }
 select(ids:readonly CollectionId[]):void{
  const source=this.reads.source();if(!this.allowed()||this.pending()||source.kind!=='ready')return;
  const eligible=new Set((source.result?.rows??[]).filter(row=>!row.isDeleted).map(row=>row.id));
  const safe=[...new Set(ids.filter((id):id is number=>typeof id==='number'&&eligible.has(id)))];
  this.selection.set({source,ids:safe});
 }
 clearSelection():void{this.selection.set(null);}
 request(row:CountryListItem,action:'archive'|'restore'):void{
  if(this.entry()||!this.can(row,action))return;const source=this.reads.source();if(source.kind!=='ready')return;
  this.begin(action,[(source.result?.rows??[]).find(current=>current.id===row.id)!],source);
 }
 requestBulk():void{
  const source=this.reads.source(),ids=this.selected();
  if(this.entry()||!this.allowed()||this.pending()||source.kind!=='ready'||!ids.length)return;
  if(ids.length>100){this.notices.failure('countries.bulkArchiveLimitExceeded','reference-countries',{max:100});return;}
  this.begin('bulk',(source.result?.rows??[]).filter(row=>ids.includes(row.id)),source);
 }
 private begin(action:CountryLifecycleAction,rows:readonly CountryListItem[],source:CollectionSource<CountryListItem>):void{
  this.entry.set({actor:this.auth.readIdentity()!,serial:++this.serial,action,rows,source});
 }
 cancel():void{if(!this.pending())this.invalidate();}
 confirm():void{
  const entry=this.entry();if(!entry||this.pending()||!this.authorized(entry)||entry.source!==this.reads.source())return;
  const ids=entry.rows.map(row=>row.id);if(!ids.length||ids.length>100)return;
  this.pending.set(true);
  const request=entry.action==='bulk'?this.service.bulkArchive(ids):entry.action==='restore'?this.service.restore(ids[0]):this.service.archive(ids[0]);
  this.operation=request.pipe(take(1),throwIfEmpty()).subscribe({next:count=>{
   if(!this.current(entry))return;
   if(entry.action!=='restore')this.records.removed(entry.source,row=>row.id,entry.rows.map(row=>row.id));
   this.notices.success(entry.action==='bulk'?'countries.bulkArchived':entry.action==='restore'?'countries.restored':'countries.archived','reference-countries',{count});
   this.invalidate();this.clearSelection();this.reads.refresh();
  },error:(error:unknown)=>{
   if(!this.current(entry))return;
   const failure=error instanceof CommandFailure?error:new CommandFailure('uncertain',null),uncertain=failure.outcome==='uncertain',denied=failure.status===401||failure.status===403;
   this.invalidate();if(denied)this.deniedActor.set(entry.actor);
   this.notices.failure(denied?'authorization.forbidden.title':uncertain?'countries.lifecycleUncertain':countryLifecycleError(failure.codes,entry.action),denied?'core':'reference-countries',{},uncertain?'imports.submissionUncertainTitle':'errorDialog.title');
   if(uncertain){this.clearSelection();this.reads.refresh();}
  }});
 }
 private current(entry:Confirmation):boolean{return !this.destroy.destroyed&&this.entry()===entry&&this.authorized(entry);}
 invalidate():void{this.entry.set(null);this.operation?.unsubscribe();this.operation=null;this.pending.set(false);}
}
