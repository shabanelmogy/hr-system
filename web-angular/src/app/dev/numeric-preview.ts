import { Component,inject,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,NumericField,FormContainer,PageHeader,applyServerFieldErrors } from '../shared/ui/public-api';

@Component({imports:[ReactiveFormsModule,ActionButton,NumericField,FormContainer,PageHeader,UiTextPipe],template:`
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
  <erp-form data-testid="form" [form]="form" [title]="'numericField.title'|uiText" [submitLabel]="'actions.save'|uiText" (validSubmit)="save()">
   <erp-numeric-field data-testid="decimal" [formControl]="form.controls.decimal" [label]="'numericField.decimal'|uiText" [help]="'numericField.help'|uiText" [readOnly]="readonly()" [maxFractionDigits]="limited()?2:null" required [messages]="messages()" />
   <erp-numeric-field data-testid="integer" [formControl]="form.controls.integer" mode="integer" [label]="'numericField.integerLabel'|uiText" [help]="'numericField.help'|uiText" [min]="'0'" [max]="'9007199254740993'" [readOnly]="readonly()" [messages]="messages()" />
  </erp-form>
  <output data-testid="state" [attr.data-decimal]="form.controls.decimal.value" [attr.data-integer]="form.controls.integer.value" [attr.data-valid]="form.valid" [attr.data-saved]="saved()" [attr.data-snapshot]="snapshot()">{{form.controls.decimal.value}} · {{form.controls.integer.value}}</output>
 </main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}output{display:block;direction:ltr;overflow-wrap:anywhere;margin-block:16px;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class NumericPreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;
 readonly form=new FormGroup({decimal:new FormControl('0.10000000000000001',{nonNullable:true,validators:Validators.required}),integer:new FormControl('9007199254740993',{nonNullable:true})});
 readonly readonly=signal(false);readonly limited=signal(false);readonly saved=signal(0);readonly snapshot=signal('');
 constructor(){void this.locale.loadNamespace('core');}
 messages(){return{required:this.locale.translate('validation.required')};}
 reset(){this.form.reset({decimal:'',integer:''});this.limited.set(false);this.saved.set(0);this.snapshot.set('');}
 patch(){this.form.patchValue({decimal:'0.10000000000000001',integer:'9007199254740993'});}
 serverError(){applyServerFieldErrors(this.form,{decimal:this.locale.translate('numericField.invalid')});}
 toggleDisabled(){if(this.form.controls.decimal.disabled)this.form.enable();else this.form.disable();}
 save(){this.snapshot.set(JSON.stringify(this.form.getRawValue()));this.saved.update(n=>n+1);}
}
