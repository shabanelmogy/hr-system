import { computed,DestroyRef,effect,inject,Injectable,isDevMode,signal,untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject,Subscription,take,throwIfEmpty } from 'rxjs';
import { AuthSession,type Session } from '../../../../../platform/auth/session.public-api';
import { CommandFailure,UnsavedChanges } from '../../../../../shared/data/public-api';
import { applyServerFieldErrors,FeedbackNotifications,type CloseConsent } from '../../../../../shared/ui/public-api';
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
 private readonly values=signal({...emptyCountryDraft});private readonly baseline=signal(countryDraftKey(emptyCountryDraft));
 private readonly completed=new Subject<CountrySaved>();private readonly invalid=new Subject<void>();
 readonly saved=this.completed.asObservable();readonly errorsChanged=this.invalid.asObservable();
 readonly form=createCountryForm();readonly revision=signal(0);readonly pending=signal(false);readonly uncertain=signal(false);
 readonly phase=signal<'loading'|'ready'|'error'|'forbidden'>('ready');readonly feedback=signal('');readonly feedbackKind=signal<'error'|'success'>('error');
 readonly canCreate=computed(()=>countryWriteAllowed(this.auth.readIdentity(),'Create')&&this.auth.readIdentity()!==this.deniedActor()&&this.reads.source().kind!=='forbidden');
 readonly active=computed(()=>{const entry=this.context();return!!entry&&entry.actor===this.auth.readIdentity()&&countryWriteAllowed(entry.actor,entry.mode==='create'?'Create':'Edit');});
 readonly identity=computed(()=>'country-editor:'+(this.context()?.serial??0));readonly mode=computed(()=>this.context()?.mode??'create');
 readonly unsaved=computed(()=>this.active()&&countryDraftKey(this.values())!==this.baseline());
 readonly locked=computed(()=>this.pending()||this.uncertain());readonly development=isDevMode();
 private mockIndex=0;
 constructor(){
  this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>{this.values.set(this.form.getRawValue());this.revision.update(value=>value+1);});
  const unregister=this.drafts.register({read:()=>({identity:this.identity(),revision:this.revision(),active:this.active(),unsaved:this.unsaved(),pending:this.pending()}),invalidate:()=>this.invalidate()});
  effect(()=>{const actor=this.auth.readIdentity(),entry=this.context();if(entry&&(actor!==entry.actor||!countryWriteAllowed(actor,entry.mode==='create'?'Create':'Edit')))untracked(()=>this.invalidate());});
  this.destroy.onDestroy(()=>{unregister();this.operation?.unsubscribe();this.completed.complete();this.invalid.complete();});
 }
 canEdit(id:number):boolean{
  const view=this.reads.view();return countryWriteAllowed(this.auth.readIdentity(),'Edit')&&this.auth.readIdentity()!==this.deniedActor()&&view.kind==='ready'&&view.data.items.some(row=>row.id===id&&!row.isDeleted);
 }
 create():void{if(!this.canCreate()||this.active()||this.pending()||this.drafts.busy())return;this.begin('create',null);this.phase.set('ready');}
 edit(id:number):void{if(!this.canEdit(id)||this.active()||this.pending()||this.drafts.busy())return;const entry=this.begin('edit',id);this.load(entry);}
 private begin(mode:'create'|'edit',id:number|null):EditorContext{
  this.operation?.unsubscribe();const entry={actor:this.auth.readIdentity()!,serial:++this.serial,mode,id};this.context.set(entry);
  this.pending.set(false);this.uncertain.set(false);this.feedback.set('');this.feedbackKind.set('error');this.reset(emptyCountryDraft);return entry;
 }
 private current(entry:EditorContext):boolean{return this.context()===entry&&this.active()&&!this.destroy.destroyed;}
 private reset(value:typeof emptyCountryDraft):void{this.form.reset(value);this.values.set(this.form.getRawValue());this.baseline.set(countryDraftKey(value));}
 private load(entry:EditorContext):void{
  if(!this.current(entry)||entry.id===null)return;this.phase.set('loading');this.operation?.unsubscribe();
  this.operation=this.service.detail(entry.id).pipe(take(1),throwIfEmpty()).subscribe({next:country=>{
   if(!this.current(entry))return;if(country.isDeleted){this.phase.set('error');return;}
   this.reset(countryDetailDraft(country));this.phase.set('ready');
  },error:()=>{if(this.current(entry))this.phase.set('error');}});
 }
 retry():void{const entry=this.context();if(entry&&this.phase()==='error'&&!this.pending())this.load(entry);}
 save():void{
  const entry=this.context();if(!entry||!this.current(entry)||this.pending()||this.uncertain()||this.phase()!=='ready')return;
  this.form.markAllAsTouched();if(this.form.invalid){this.invalid.next();return;}
  const draft=this.form.getRawValue();try{parseCountryMutation(draft);}catch{this.invalid.next();return;}
  const revision=this.revision();this.pending.set(true);this.feedback.set('');this.feedbackKind.set('error');
  const request=entry.mode==='create'?this.service.create(draft):this.service.update(entry.id!,draft);
  this.operation=request.pipe(take(1),throwIfEmpty()).subscribe({next:country=>{
   if(!this.current(entry))return;this.pending.set(false);this.baseline.set(countryDraftKey(draft));
   this.completed.next({mode:entry.mode,country});
   if(this.revision()===revision)this.invalidate();else{this.feedbackKind.set('success');this.feedback.set(entry.mode==='create'?'countries.created':'countries.updated');}
  },error:(error:unknown)=>{
   if(!this.current(entry))return;this.pending.set(false);
   const failure=error instanceof CommandFailure?error:new CommandFailure('uncertain',null);
   this.uncertain.set(failure.outcome==='uncertain');
   const denied=failure.status===401||failure.status===403;
   const errorKey=denied?'authorization.forbidden.title':this.uncertain()?'countries.mutationUncertain':entry.mode==='create'?'countries.createError':'countries.updateError';
   this.feedback.set(this.uncertain()?errorKey:'');
   if(denied||!Object.keys(failure.fieldErrors).length)this.notices.failure(errorKey,denied?'core':'reference-countries',{},this.uncertain()?'imports.submissionUncertainTitle':'errorDialog.title');
   if(denied){this.deniedActor.set(entry.actor);this.phase.set('forbidden');return;}
   applyServerFieldErrors(this.form,failure.fieldErrors);this.invalid.next();
  }});
 }
 close(consent:CloseConsent):void{
  if(!this.active()||this.pending()||consent.identity!==this.identity()||consent.revision!==this.revision())return;
  const review=this.uncertain();this.invalidate();if(review)this.reads.refresh();
 }
 invalidate():void{this.context.set(null);this.operation?.unsubscribe();this.operation=null;this.pending.set(false);this.uncertain.set(false);this.feedback.set('');this.reset(emptyCountryDraft);}
 generate():void{
  if(!this.development||!this.active()||this.locked()||this.phase()!=='ready')return;
  const samples=[{nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:'EGY',phoneCode:'+20',currencyCode:'EGP'},{nameAr:'السعودية',nameEn:'Saudi Arabia',alpha2Code:'SA',alpha3Code:'SAU',phoneCode:'+966',currencyCode:'SAR'},{nameAr:'الإمارات',nameEn:'United Arab Emirates',alpha2Code:'AE',alpha3Code:'ARE',phoneCode:'+971',currencyCode:'AED'}];
  this.form.setValue(samples[this.mockIndex++%samples.length]);this.form.markAsDirty();
 }
}
