import { Component,inject,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,DateField,FormContainer,PageHeader,applyServerFieldErrors } from '../shared/ui/public-api';

@Component({imports:[ReactiveFormsModule,ActionButton,DateField,FormContainer,PageHeader,UiTextPipe],template:`
 <main><erp-page-header [title]="'dateField.chooseDate'|uiText" />
  <div class="tools">
   @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
   <erp-button data-testid="language" [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" />
   <erp-button data-testid="mode" [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode')|uiText" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
   <erp-button data-testid="readonly" [label]="'actions.viewOnly'|uiText" [pressed]="readonly()" (activated)="readonly.set(!readonly())" />
   <erp-button data-testid="disable" [label]="'common.loading'|uiText" (activated)="toggleDisabled()" />
   <erp-button data-testid="reset" [label]="'general.reset'|uiText" (activated)="reset()" />
   <erp-button data-testid="patch" [label]="'actions.edit'|uiText" (activated)="patch()" />
   <erp-button data-testid="server-error" [label]="'common.error'|uiText" (activated)="serverError()" />
  </div>
  <erp-form data-testid="form" [form]="form" [title]="'dateField.chooseDate'|uiText" [submitLabel]="'actions.save'|uiText" (validSubmit)="saved.update(increment)">
   <erp-date-field data-testid="start" [formControl]="form.controls.start" [label]="'auditLog.fields.StartDate'|uiText" [help]="'dateField.formatHelp'|uiText" [readOnly]="readonly()" required [messages]="messages()" />
   <erp-date-field data-testid="end" [formControl]="form.controls.end" [label]="'auditLog.fields.EndDate'|uiText" [help]="'dateField.formatHelp'|uiText" [min]="'2024-02-01'" [max]="'2024-03-31'" [readOnly]="readonly()" [messages]="messages()" />
  </erp-form>
  <output data-testid="state" [attr.data-start]="form.controls.start.value" [attr.data-end]="form.controls.end.value" [attr.data-valid]="form.valid" [attr.data-saved]="saved()">{{form.controls.start.value}} · {{form.controls.end.value}}</output>
 </main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}erp-date-field{margin-block-end:20px}output{display:block;direction:ltr;overflow-wrap:anywhere;margin-block:16px;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class DatePreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;
 readonly form=new FormGroup({start:new FormControl('2024-02-29',{nonNullable:true,validators:Validators.required}),end:new FormControl('2024-03-01',{nonNullable:true})});
 readonly readonly=signal(false);readonly saved=signal(0);readonly increment=(n:number)=>n+1;
 constructor(){void this.locale.loadNamespace('core');}
 messages(){return{required:this.locale.translate('validation.required')};}
 reset(){this.form.reset({start:'',end:''});this.saved.set(0);}
 patch(){this.form.patchValue({start:'2024-02-29',end:'2024-03-01'});}
 serverError(){applyServerFieldErrors(this.form,{start:this.locale.translate('validation.invalidDate')});}
 toggleDisabled(){if(this.form.controls.start.disabled)this.form.enable();else this.form.disable();}
}
