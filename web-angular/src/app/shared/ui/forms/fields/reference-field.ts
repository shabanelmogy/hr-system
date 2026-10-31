import { booleanAttribute,Component,computed,effect,forwardRef,input,output,signal,untracked,viewChild } from '@angular/core';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { UiTextPipe } from '../../../../platform/localization/public-api';
import { ActionButton } from '../../buttons/public-api';
import { FeedbackState } from '../../feedback/feedback-state';
import { FormFieldControl } from '../form-field-control';
import { TextField } from './text-field';
import { inspectReference,referenceOptionAttributes,resolvedReference,validReferenceId,type ReferenceId,type ReferenceOption,type ReferenceSelection,type ReferenceSource } from './reference.types';

@Component({selector:'erp-reference-field',imports:[ReactiveFormsModule,Select,TextField,ActionButton,FeedbackState,UiTextPipe],providers:[{provide:FormFieldControl,useExisting:forwardRef(()=>ReferenceField)}],template:`
 <label [id]="id+'-label'" [for]="id">{{label()}}@if(required()){<span aria-hidden="true"> *</span>}</label>
 <div class="reference-control" [class.invalid]="!!error()">
  <p-select [formControl]="control" [options]="options()" optionLabel="label" optionValue="value" optionDisabled="disabled" [inputId]="id" [ariaLabelledBy]="id+'-label'" [readonly]="readOnly()" [required]="required()" [invalid]="!!error()" [loading]="view().kind==='loading'" [placeholder]="placeholder()" [autoOptionFocus]="false" [selectOnFocus]="false" [filter]="false" [selectionMessage]="'reference.selectionMessage'|uiText" [emptySelectionMessage]="'reference.emptySelection'|uiText" [emptyMessage]="'common.noOptionsFound'|uiText" [fluid]="true" appendTo="body" panelStyleClass="erp-reference-overlay" scrollHeight="min(20rem,45dvh)" [pt]="attributes()" [dt]="tokens" (onBlur)="blur()" (onHide)="blur()">
   <ng-template #selectedItem><span class="selected-copy" [title]="selectedCaption()">{{selectedCaption()}}</span></ng-template>
   <ng-template #item let-option><div class="option-copy"><span>{{option.label}}</span>@if(option.description){<small>{{option.description}}</small>}</div></ng-template>
   <ng-template #header><div class="reference-header">
    @if(searchable()){<erp-text-field [formControl]="searchControl" [label]="'general.search'|uiText" [placeholder]="'general.search'|uiText" labelVisibility="sr-only" (keydown)="searchKey($event)" />}
    @if(view().kind!=='ready'){<erp-feedback-state layout="inline" [kind]="feedbackKind()" [title]="feedbackTitle()" [actionLabel]="view().kind==='error'?('actions.retry'|uiText):''" (action)="retry.emit()" />}
    @else if(!view().options.length){<erp-feedback-state layout="inline" kind="empty" [title]="'common.noOptionsFound'|uiText" />}
   </div></ng-template>
   <ng-template #empty><span aria-hidden="true"></span></ng-template>
   <ng-template #footer>@if(view().kind==='ready'&&view().hasMore){<div class="reference-footer"><erp-button [label]="'reference.loadMore'|uiText" variant="text" (activated)="requestMore()" /></div>}</ng-template>
  </p-select>
  @if(clearable()&&value()!==null&&!readOnly()&&!disabled()&&!blocked()){
   <erp-button appearance="icon" variant="text" [label]="'general.clear'|uiText" (activated)="clear()"><span buttonIcon aria-hidden="true">×</span></erp-button>
  }
 </div>
 @if(blocked()){<erp-feedback-state layout="inline" kind="forbidden" [title]="'authorization.forbidden.title'|uiText" />}
 @if(help()){<p class="help" [id]="id+'-help'">{{help()}}</p>}
 @if(error();as message){<p class="error" [id]="id+'-error'">{{message}}</p>}
 `,styleUrl:'./reference-field.scss'})
export class ReferenceField extends FormFieldControl<ReferenceId|null>{
 readonly value=signal<ReferenceId|null>(null);readonly source=input.required<ReferenceSource>();readonly selection=input<ReferenceSelection|null>(null);
 readonly searchText=input('');readonly searchable=input(true,{transform:booleanAttribute});readonly clearable=input(true,{transform:booleanAttribute});readonly placeholder=input('');
 readonly searchChange=output<string>();readonly loadMore=output<void>();readonly retry=output<void>();
 readonly control=new FormControl<ReferenceId|null>(null);readonly searchControl=new FormControl('',{nonNullable:true});private readonly select=viewChild(Select);
 readonly view=computed(()=>inspectReference(this.source(),this.searchable()?this.searchText():this.source().query.search));
 readonly blocked=computed(()=>this.view().kind==='forbidden');
 readonly options=computed(()=>{
  const view=this.view(),value=this.value(),result=[...view.options];if(value===null)return result;
  if(result.some(option=>option.value===value))return result;
  const resolved=view.kind==='forbidden'?null:resolvedReference(this.selection(),this.source().query.scopeKey,value);
  const unresolved=view.kind!=='forbidden'&&this.selection()?.scopeKey===this.source().query.scopeKey&&this.selection()?.value===value&&this.selection()?.kind==='loading';
  const retained:ReferenceOption={value,label:resolved?.label??this.runtime.translate(unresolved?'common.loading':'reference.unavailable'),disabled:true,description:[resolved?.description,this.runtime.translate('reference.currentSelection')].filter(Boolean).join(' · ')};
  return[retained,...result];
 });
 readonly attributes=computed(()=>({label:{'aria-describedby':this.describedBy(),'aria-invalid':this.error()?'true':null,'aria-busy':this.view().kind==='loading'?'true':null},option:referenceOptionAttributes,list:{'aria-label':this.label()},dropdown:{'aria-hidden':'true'},overlay:{'aria-label':this.label()}}));
 readonly selectedCaption=computed(()=>this.options().find(option=>option.value===this.value())?.label??this.placeholder());
 readonly tokens={root:{background:'var(--surface)',color:'var(--foreground)',borderColor:'transparent',hoverBorderColor:'transparent',focusBorderColor:'transparent',shadow:'none',paddingY:'9px',focusRing:{width:'0px',shadow:'none'}},overlay:{background:'var(--surface)',color:'var(--foreground)',borderColor:'var(--border)'}};
 private previousScope:string|undefined;
 constructor(){
  super();
  effect(()=>{this.control.setValue(this.value(),{emitEvent:false});if(this.disabled()||this.blocked())this.control.disable({emitEvent:false});else this.control.enable({emitEvent:false});});
  effect(()=>this.searchControl.setValue(this.searchText(),{emitEvent:false}));
  effect(()=>{const scope=this.source().query.scopeKey,locked=this.disabled()||this.readOnly()||this.blocked();untracked(()=>{if(this.previousScope!==undefined&&scope!==this.previousScope||locked)this.select()?.hide(true);this.previousScope=scope;});});
  this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>this.choose(value));
  this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>{if(!this.disabled()&&!this.readOnly()&&!this.blocked())this.searchChange.emit(value);});
 }
 writeValue(value:unknown){this.value.set(validReferenceId(value)?value:null);}
 focus(){this.select()?.focus();}
 choose(value:unknown){
  if(this.view().kind==='ready'&&validReferenceId(value)&&this.view().options.some(option=>option.value===value&&!option.disabled)&&!this.disabled()&&!this.readOnly()&&!this.blocked())this.accept(value);
  this.control.setValue(this.value(),{emitEvent:false});
 }
 clear(){if(this.clearable()&&!this.blocked()){this.accept(null);this.blur();this.focus();}}
 requestMore(){if(this.view().kind==='ready'&&this.view().hasMore&&!this.disabled()&&!this.readOnly()&&!this.blocked())this.loadMore.emit();}
 feedbackKind(){const kind=this.view().kind;return kind==='ready'?'empty':kind;}
 feedbackTitle(){const kind=this.view().kind;return this.runtime.translate(kind==='loading'?'common.loading':kind==='forbidden'?'authorization.forbidden.title':'common.error');}
 searchKey(event:KeyboardEvent){
  if(event.isComposing)return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.select()?.hide(true);}
  if(event.key==='Enter'){event.preventDefault();event.stopPropagation();}
  if(event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();this.focus();}
 }
}
