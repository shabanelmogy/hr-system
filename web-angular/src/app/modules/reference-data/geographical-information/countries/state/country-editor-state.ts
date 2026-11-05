import { computed,DestroyRef,effect,inject,Injectable,isDevMode,linkedSignal,signal,untracked } from '@angular/core';
import { submit, type ValidationError } from '@angular/forms/signals';
import { firstValueFrom,Subject,Subscription,take,takeUntil,throwIfEmpty } from 'rxjs';
import { AuthSession,type Session } from '../../../../../platform/auth/session.public-api';
import { CommandFailure,UnsavedChanges } from '../../../../../shared/data/public-api';
import { mapServerFieldErrors,FeedbackNotifications,type CloseConsent } from '../../../../../shared/ui/public-api';
import { CountryService } from '../services/country-service';
import { countryWriteAllowed } from '../types/country-actions';
import type { CountryDetail } from '../types/country';
import { countryDetailDraft,countryDraftKey,createCountryForm,emptyCountryDraft,parseCountryMutation } from '../validation/country-mutation';
import { CountryReadState } from './country-read-state';

interface EditorContext {readonly actor:Session;readonly serial:number;readonly mode:'create'|'edit';readonly id:number|null;}
export interface CountrySaved {readonly mode:'create'|'edit';readonly country:CountryDetail;}
@Injectable()
export class CountryEditorState {
 private readonly auth=inject(AuthSession);private readonly service=inject(CountryService);private readonly reads=inject(CountryReadState);
 private readonly drafts=inject(UnsavedChanges);private readonly destroy=inject(DestroyRef);
 private readonly notices=inject(FeedbackNotifications);
 private readonly context=signal<EditorContext|null>(null);private serial=0;private operation:Subscription|null=null;
 private readonly deniedActor=signal<Session|null>(null);
 private readonly baseline=signal(countryDraftKey(emptyCountryDraft));
 private readonly completed=new Subject<CountrySaved>();private readonly invalid=new Subject<void>();
 readonly saved=this.completed.asObservable();readonly errorsChanged=this.invalid.asObservable();
 private readonly cancelWrite=new Subject<void>();
 readonly form=createCountryForm({submission:{ignoreValidators:'none',action:()=>this.persist(),onInvalid:()=>this.invalid.next()}});readonly revision=linkedSignal<typeof emptyCountryDraft,number>({source:()=>this.form().value(),computation:(_value,previous)=>(previous?.value??0)+1});readonly pending=computed(()=>this.form().submitting());readonly uncertain=signal(false);
 readonly phase=signal<'loading'|'ready'|'error'|'forbidden'>('ready');readonly feedback=signal('');readonly feedbackKind=signal<'error'|'success'>('error');
 readonly canCreate=computed(()=>countryWriteAllowed(this.auth.readIdentity(),'Create')&&this.auth.readIdentity()!==this.deniedActor()&&this.reads.source().kind!=='forbidden');
 readonly active=computed(()=>{const entry=this.context();return!!entry&&entry.actor===this.auth.readIdentity()&&countryWriteAllowed(entry.actor,entry.mode==='create'?'Create':'Edit');});
 readonly identity=computed(()=>'country-editor:'+(this.context()?.serial??0));readonly mode=computed(()=>this.context()?.mode??'create');
 readonly unsaved=computed(()=>this.active()&&countryDraftKey(this.form().value())!==this.baseline());
 readonly locked=computed(()=>this.pending()||this.uncertain());readonly development=isDevMode();
 private mockIndex=0;
 constructor(){
  const unregister=this.drafts.register({read:()=>({identity:this.identity(),revision:this.revision(),active:this.active(),unsaved:this.unsaved(),pending:this.pending()}),invalidate:()=>this.invalidate()});
  effect(()=>{const actor=this.auth.readIdentity(),entry=this.context();if(entry&&(actor!==entry.actor||!countryWriteAllowed(actor,entry.mode==='create'?'Create':'Edit')))untracked(()=>this.invalidate());});
  this.destroy.onDestroy(()=>{unregister();this.cancelWrite.next();this.cancelWrite.complete();this.operation?.unsubscribe();this.completed.complete();this.invalid.complete();});
 }
 canEdit(id:number):boolean{
  const view=this.reads.view();return countryWriteAllowed(this.auth.readIdentity(),'Edit')&&this.auth.readIdentity()!==this.deniedActor()&&view.kind==='ready'&&view.data.items.some(row=>row.id===id&&!row.isDeleted);
 }
 create():void{if(!this.canCreate()||this.active()||this.pending()||this.drafts.busy())return;this.begin('create',null);this.phase.set('ready');}
 edit(id:number):void{if(!this.canEdit(id)||this.active()||this.pending()||this.drafts.busy())return;const entry=this.begin('edit',id);this.load(entry);}
 private begin(mode:'create'|'edit',id:number|null):EditorContext{
  this.operation?.unsubscribe();const entry={actor:this.auth.readIdentity()!,serial:++this.serial,mode,id};this.context.set(entry);
  this.uncertain.set(false);this.feedback.set('');this.feedbackKind.set('error');this.reset(emptyCountryDraft);return entry;
 }
 private current(entry:EditorContext):boolean{return this.context()===entry&&this.active()&&!this.destroy.destroyed;}
 private reset(value:typeof emptyCountryDraft):void{this.form().reset(value);this.baseline.set(countryDraftKey(value));}
 private load(entry:EditorContext):void{
  if(!this.current(entry)||entry.id===null)return;this.phase.set('loading');this.operation?.unsubscribe();
  this.operation=this.service.detail(entry.id).pipe(take(1),throwIfEmpty()).subscribe({next:country=>{
   if(!this.current(entry))return;if(country.isDeleted){this.phase.set('error');return;}
   this.reset(countryDetailDraft(country));this.phase.set('ready');
  },error:()=>{if(this.current(entry))this.phase.set('error');}});
 }
 retry():void{const entry=this.context();if(entry&&this.phase()==='error'&&!this.pending())this.load(entry);}
 async save():Promise<boolean>{
  const entry=this.context();if(!entry||!this.current(entry)||this.locked()||this.phase()!=='ready')return false;
  return submit(this.form);
 }
 private async persist():Promise<ValidationError.WithFieldTree[]|undefined>{
  const entry=this.context();if(!entry||!this.current(entry)||this.uncertain()||this.phase()!=='ready')return[{kind:'unavailable',fieldTree:this.form}];
  const draft=this.form().value();parseCountryMutation(draft);
  const revision=this.revision();this.feedback.set('');this.feedbackKind.set('error');
  try{
   const request=entry.mode==='create'?this.service.create(draft):this.service.update(entry.id!,draft);
   const country=await firstValueFrom(request.pipe(take(1),takeUntil(this.cancelWrite),throwIfEmpty()));
   if(!this.current(entry))return;
   this.baseline.set(countryDraftKey(draft));this.completed.next({mode:entry.mode,country});
   if(this.revision()===revision)this.invalidate();else{this.feedbackKind.set('success');this.feedback.set(entry.mode==='create'?'countries.created':'countries.updated');}
   return;
  }catch(error:unknown){
   if(!this.current(entry))return;
   const failure=error instanceof CommandFailure?error:new CommandFailure('uncertain',null);
   this.uncertain.set(failure.outcome==='uncertain');
   const denied=failure.status===401||failure.status===403;
   const errorKey=denied?'authorization.forbidden.title':this.uncertain()?'countries.mutationUncertain':entry.mode==='create'?'countries.createError':'countries.updateError';
   this.feedback.set(this.uncertain()?errorKey:'');
   if(denied||!Object.keys(failure.fieldErrors).length)this.notices.failure(errorKey,denied?'core':'reference-countries',{},this.uncertain()?'imports.submissionUncertainTitle':'errorDialog.title');
   if(denied){this.deniedActor.set(entry.actor);this.phase.set('forbidden');}
   const errors=mapServerFieldErrors(this.form,failure.fieldErrors,draft);
   // Command feedback owns transport failures. Only field validation belongs in
   // the form tree, otherwise an unchanged retry would be blocked as invalid.
   return errors.length?errors:undefined;
  }
 }
 close(consent:CloseConsent):void{
  if(!this.active()||this.pending()||consent.identity!==this.identity()||consent.revision!==this.revision())return;
  const review=this.uncertain();this.invalidate();if(review)this.reads.refresh();
 }
 invalidate():void{this.context.set(null);this.cancelWrite.next();this.operation?.unsubscribe();this.operation=null;this.uncertain.set(false);this.feedback.set('');this.reset(emptyCountryDraft);}
 generate():void{
  if(!this.development||!this.active()||this.locked()||this.phase()!=='ready')return;
  const samples=[{nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:'EGY',phoneCode:'+20',currencyCode:'EGP'},{nameAr:'السعودية',nameEn:'Saudi Arabia',alpha2Code:'SA',alpha3Code:'SAU',phoneCode:'+966',currencyCode:'SAR'},{nameAr:'الإمارات',nameEn:'United Arab Emirates',alpha2Code:'AE',alpha3Code:'ARE',phoneCode:'+971',currencyCode:'AED'}];
  this.form().value.set(samples[this.mockIndex++%samples.length]);this.form().markAsDirty();
 }
}
