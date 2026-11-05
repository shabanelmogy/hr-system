import { Component,inject,signal } from '@angular/core';
import { disabled,form,FormField,readonly as readOnly,required,submit } from '@angular/forms/signals';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,NumericField,FormContainer,PageHeader,mapServerFieldErrors,validateNumericText } from '../shared/ui/public-api';

@Component({imports:[FormField,ActionButton,NumericField,FormContainer,PageHeader,UiTextPipe],template:`
 <main><erp-page-header [title]="'numericField.title'|uiText" />
  <div class="tools">
   @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
   <erp-button data-testid="language" [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" />
   <erp-button data-testid="mode" [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode')|uiText" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
   <erp-button data-testid="readonly" [label]="'actions.viewOnly'|uiText" [pressed]="readonly()" (activated)="readonly.set(!readonly())" />
   <erp-button data-testid="disable" [label]="'common.loading'|uiText" (activated)="toggleDisabled()" />
   <erp-button data-testid="reset" [label]="'general.reset'|uiText" (activated)="reset()" />
   <erp-button data-testid="patch" [label]="'actions.edit'|uiText" (activated)="patch()" />
   <erp-button data-testid="server-error" [label]="'common.error'|uiText" (activated)="serverError()" />
   <erp-button data-testid="limit" [label]="'actions.gridOptions'|uiText" [pressed]="limited()" (activated)="limited.set(!limited())" />
  </div>
  <erp-form data-testid="form" [form]="form" [title]="'numericField.title'|uiText" [submitLabel]="'actions.save'|uiText">
   <erp-numeric-field data-testid="decimal" [formField]="form.decimal" [label]="'numericField.decimal'|uiText" [help]="'numericField.help'|uiText" [maxFractionDigits]="limited()?2:null" [messages]="messages()" />
   <erp-numeric-field data-testid="integer" [formField]="form.integer" mode="integer" [label]="'numericField.integerLabel'|uiText" [help]="'numericField.help'|uiText" [messages]="messages()" />
  </erp-form>
  <output data-testid="state" [attr.data-decimal]="form.decimal().value()" [attr.data-integer]="form.integer().value()" [attr.data-valid]="form().valid()" [attr.data-saved]="saved()" [attr.data-snapshot]="snapshot()">{{form.decimal().value()}} · {{form.integer().value()}}</output>
 </main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}output{display:block;direction:ltr;overflow-wrap:anywhere;margin-block:16px;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class NumericPreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;
 readonly disabledState=signal(false);
 readonly form=form(signal({decimal:'0.10000000000000001',integer:'9007199254740993'}),path=>{
  disabled(path,{when:()=>this.disabledState()});readOnly(path,{when:()=>this.readonly()});required(path.decimal);
  validateNumericText(path.decimal,()=>({maxFractionDigits:this.limited()?2:null}));
  validateNumericText(path.integer,()=>({mode:'integer',min:'0',max:'9007199254740993'}));
 },{submission:{ignoreValidators:'none',action:async()=>this.save()}});
 readonly readonly=signal(false);readonly limited=signal(false);readonly saved=signal(0);readonly snapshot=signal('');
 constructor(){void this.locale.loadNamespace('core');}
 messages(){return{required:this.locale.translate('validation.required')};}
 reset(){this.form().reset({decimal:'',integer:''});this.limited.set(false);this.saved.set(0);this.snapshot.set('');}
 patch(){this.form().value.update(value=>({...value,decimal:'0.10000000000000001',integer:'9007199254740993'}));}
 serverError(){void submit(this.form,{ignoreValidators:'all',action:async()=>mapServerFieldErrors(this.form,{decimal:this.locale.translate('numericField.invalid')},this.form().value())});}
 toggleDisabled(){this.disabledState.update(value=>!value);}
 save(){this.snapshot.set(JSON.stringify(this.form().value()));this.saved.update(n=>n+1);}
}
