import { Component,effect,inject,signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { disabled,form,FormField,readonly as readOnly,required,submit,validate } from '@angular/forms/signals';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,BooleanField,FormContainer,PageHeader,TextField,mapServerFieldErrors } from '../shared/ui/public-api';

@Component({imports:[FormField,ActionButton,BooleanField,TextField,FormContainer,PageHeader,UiTextPipe,JsonPipe],template:`
 <main><erp-page-header [title]="'booleanField.title'|uiText" />
  <div class="tools">
   @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
   <erp-button data-testid="language" [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" />
   <erp-button data-testid="readonly" [label]="'actions.viewOnly'|uiText" [pressed]="readonly()" (activated)="readonly.set(!readonly())" />
   <erp-button data-testid="disable" [label]="'common.loading'|uiText" (activated)="toggleDisabled()" />
   <erp-button data-testid="reset" [label]="'general.reset'|uiText" (activated)="reset()" />
   <erp-button data-testid="patch" [label]="'actions.edit'|uiText" (activated)="patch()" />
   <erp-button data-testid="server-error" [label]="'common.error'|uiText" (activated)="serverError()" />
   <erp-button data-testid="swap" [label]="'actions.gridOptions'|uiText" (activated)="swapped.set(!swapped())" />
  </div>
  <erp-form data-testid="form" [form]="form" [title]="'booleanField.title'|uiText" [submitLabel]="'actions.save'|uiText">
   <erp-text-field data-testid="name" [formField]="form.name" [label]="'general.nameEn'|uiText" [messages]="messages()" />
   <erp-boolean-field data-testid="checkbox" [formField]="form.checkbox" [kind]="swapped()?'switch':'checkbox'" [label]="'booleanField.checkbox'|uiText" [help]="'booleanField.help'|uiText" [messages]="messages()" />
   <erp-boolean-field data-testid="switch" [formField]="form.switch" [kind]="swapped()?'checkbox':'switch'" [label]="'booleanField.switch'|uiText" [help]="'booleanField.help'|uiText" [messages]="messages()" />
   <erp-boolean-field data-testid="consent" [formField]="form.consent" [label]="'booleanField.requiredLabel'|uiText" [help]="'booleanField.requiredHelp'|uiText" [messages]="messages()" />
  </erp-form>
  <output data-testid="state" [attr.data-checkbox]="form.checkbox().value()" [attr.data-switch]="form.switch().value()" [attr.data-consent]="form.consent().value()" [attr.data-saved]="saved()" [attr.data-changes]="changes()" [attr.data-snapshot]="snapshot()">{{form().value()|json}}</output>
 </main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}output{display:block;direction:ltr;overflow-wrap:anywhere;margin-block:16px;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class BooleanPreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;
 readonly disabledState=signal(false);
 readonly form=form(signal({name:'',checkbox:false,switch:false,consent:false}),path=>{
  disabled(path,{when:()=>this.disabledState()});required(path.name);
  for(const field of [path.checkbox,path.switch,path.consent])readOnly(field,{when:()=>this.readonly()});
  required(path.consent);validate(path.consent,({value})=>value()===true?undefined:{kind:'required'});
 },{submission:{ignoreValidators:'none',action:async()=>this.save()}});
 readonly readonly=signal(false);readonly swapped=signal(false);readonly saved=signal(0);readonly changes=signal(0);readonly snapshot=signal('');
 constructor(){void this.locale.loadNamespace('core');effect(()=>{this.form().value();this.changes.update(n=>n+1);});}
 messages(){return{required:this.locale.translate('validation.required')};}
 reset(){this.form().reset({name:'',checkbox:false,switch:false,consent:false});this.saved.set(0);this.snapshot.set('');}
 patch(){this.form().value.update(value=>({...value,checkbox:true,switch:true}));}
 serverError(){void submit(this.form,{ignoreValidators:'all',action:async()=>mapServerFieldErrors(this.form,{checkbox:this.locale.translate('booleanField.invalid')},this.form().value())});}
 toggleDisabled(){this.disabledState.update(value=>!value);}
 save(){this.snapshot.set(JSON.stringify(this.form().value()));this.saved.update(n=>n+1);}
}
