import { Component,computed,inject,output,viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalizationRuntime,UiTextPipe } from '../../../../../platform/localization/public-api';
import { ActionButton,AppIcon,DialogPanel,FeedbackState,FormCloseGuard,FormContainer,TextField,type FieldMessages } from '../../../../../shared/ui/public-api';
import { CountryEditorState,type CountrySaved } from '../state/country-editor-state';
import { countryFieldLimits,countryMutationFields,type CountryMutationField } from '../validation/country-mutation';

@Component({selector:'erp-country-editor',imports:[ReactiveFormsModule,ActionButton,AppIcon,DialogPanel,FeedbackState,FormCloseGuard,FormContainer,TextField,UiTextPipe],template:`
 <erp-dialog-panel [open]="state.active()" [title]="(state.mode()==='create'?'countries.add':'countries.edit')|uiText:'reference-countries'" [description]="(state.mode()==='create'?'countries.addSubtitle':'countries.editSubtitle')|uiText:'reference-countries'" [closeLabel]="'actions.close'|uiText" [icon]="state.mode()==='create'?'add':'edit'" [pending]="state.pending()" [showFooter]="false" (closeRequested)="closeGuard().requestClose()">
 @if(state.active()){
  @switch(state.phase()){
   @case('loading'){<erp-feedback-state kind="loading" [title]="'common.loading'|uiText" />}
   @case('error'){<erp-feedback-state kind="error" [title]="'countries.detailLoadError'|uiText:'reference-countries'" [actionLabel]="'actions.retry'|uiText" (action)="state.retry()" /><erp-button [label]="'actions.close'|uiText" variant="text" (activated)="closeGuard().requestClose()" />}
   @case('forbidden'){<erp-feedback-state kind="forbidden" [title]="'authorization.forbidden.title'|uiText" /><erp-button [label]="'actions.close'|uiText" variant="text" (activated)="closeGuard().requestClose()" />}
   @case('ready'){
    <erp-form #entryForm [form]="state.form" appearance="dialog" [hideHeader]="true" [title]="(state.mode()==='create'?'countries.add':'countries.edit')|uiText:'reference-countries'" [submitLabel]="(state.mode()==='create'?'countries.add':'actions.save')|uiText:(state.mode()==='create'?'reference-countries':'core')" [pending]="state.pending()" [readOnly]="state.uncertain()" [feedback]="state.feedback()?locale.translate(state.feedback(),'reference-countries'):''" [feedbackKind]="state.feedbackKind()" (validSubmit)="state.save()">
     @for(field of fields;track field){<erp-text-field [maxLength]="limits[field]" [showCounter]="true" counterAppearance="badge" [name]="field" [formControl]="state.form.controls[field]" [label]="label(field)" [required]="field==='nameAr'||field==='nameEn'" [readOnly]="state.locked()" [messages]="messages()[field]" [textDirection]="field==='nameAr'||field==='nameEn'?'auto':'ltr'" [inputMode]="field==='phoneCode'?'tel':'text'" />}
     @if(state.development){<erp-button formTools [label]="'countries.generateMockData'|uiText:'reference-countries'" variant="text" [disabled]="state.locked()" (activated)="state.generate()"><erp-icon buttonIcon name="refresh" /></erp-button>}
     <erp-icon formSubmitIcon [name]="state.mode()==='create'?'add':'check'" />
     <erp-button formActions [label]="'actions.cancel'|uiText" variant="outlined" [disabled]="state.pending()" (activated)="closeGuard().requestClose()" />
    </erp-form>
   }
  }
 }
 </erp-dialog-panel>
 <erp-form-close-guard [identity]="state.identity()" [revision]="state.revision()" [active]="state.active()" [unsaved]="state.unsaved()" [pending]="state.pending()" (closed)="state.close($event)" />
 `})
export class CountryEditor {
 readonly state=inject(CountryEditorState);readonly locale=inject(LocalizationRuntime);readonly fields=countryMutationFields;readonly limits=countryFieldLimits;
 readonly saved=output<CountrySaved>();readonly closeGuard=viewChild.required(FormCloseGuard);private readonly form=viewChild<FormContainer>('entryForm');
 readonly messages=computed(()=>{
  const message=(pattern:string):FieldMessages=>({required:this.locale.translate('validation.required'),minlength:this.locale.translate('validation.minLength','core',{count:2}),maxlength:this.locale.translate('validation.maxLength','core',{count:100}),invalidText:this.locale.translate('validation.invalidText'),pattern:this.locale.translate('countries.'+pattern,'reference-countries')});
  return{nameAr:message('invalidCode'),nameEn:message('invalidCode'),alpha2Code:message('invalidAlpha2Code'),alpha3Code:message('invalidAlpha3Code'),phoneCode:message('invalidPhoneCode'),currencyCode:message('invalidCurrency')};
 });
 constructor(){this.state.saved.pipe(takeUntilDestroyed()).subscribe(value=>this.saved.emit(value));this.state.errorsChanged.pipe(takeUntilDestroyed()).subscribe(()=>this.form()?.revealErrors());}
 label(field:CountryMutationField):string{return field==='nameAr'||field==='nameEn'?this.locale.translate('general.'+field):this.locale.translate('countries.'+field,'reference-countries');}
}
