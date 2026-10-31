import { Component,inject,signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,BooleanField,FormContainer,PageHeader,TextField,applyServerFieldErrors } from '../shared/ui/public-api';

@Component({imports:[ReactiveFormsModule,ActionButton,BooleanField,TextField,FormContainer,PageHeader,UiTextPipe,JsonPipe],template:`
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
  <erp-form data-testid="form" [form]="form" [title]="'booleanField.title'|uiText" [submitLabel]="'actions.save'|uiText" (validSubmit)="save()">
   <erp-text-field data-testid="name" [formControl]="form.controls.name" [label]="'general.nameEn'|uiText" required [messages]="messages()" />
   <erp-boolean-field data-testid="checkbox" [formControl]="form.controls.checkbox" [kind]="swapped()?'switch':'checkbox'" [label]="'booleanField.checkbox'|uiText" [help]="'booleanField.help'|uiText" [readOnly]="readonly()" [messages]="messages()" />
   <erp-boolean-field data-testid="switch" [formControl]="form.controls.switch" [kind]="swapped()?'checkbox':'switch'" [label]="'booleanField.switch'|uiText" [help]="'booleanField.help'|uiText" [readOnly]="readonly()" [messages]="messages()" />
   <erp-boolean-field data-testid="consent" [formControl]="form.controls.consent" [label]="'booleanField.requiredLabel'|uiText" [help]="'booleanField.requiredHelp'|uiText" [readOnly]="readonly()" required [messages]="messages()" />
  </erp-form>
  <output data-testid="state" [attr.data-checkbox]="form.controls.checkbox.value" [attr.data-switch]="form.controls.switch.value" [attr.data-consent]="form.controls.consent.value" [attr.data-saved]="saved()" [attr.data-changes]="changes()" [attr.data-snapshot]="snapshot()">{{form.getRawValue()|json}}</output>
 </main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}output{display:block;direction:ltr;overflow-wrap:anywhere;margin-block:16px;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class BooleanPreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;
 readonly form=new FormGroup({name:new FormControl('',{nonNullable:true,validators:Validators.required}),checkbox:new FormControl(false,{nonNullable:true}),switch:new FormControl(false,{nonNullable:true}),consent:new FormControl(false,{nonNullable:true,validators:Validators.requiredTrue})});
 readonly readonly=signal(false);readonly swapped=signal(false);readonly saved=signal(0);readonly changes=signal(0);readonly snapshot=signal('');
 constructor(){void this.locale.loadNamespace('core');this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>this.changes.update(n=>n+1));}
 messages(){return{required:this.locale.translate('validation.required')};}
 reset(){this.form.reset();this.saved.set(0);this.snapshot.set('');}
 patch(){this.form.patchValue({checkbox:true,switch:true});}
 serverError(){applyServerFieldErrors(this.form,{checkbox:this.locale.translate('booleanField.invalid')});}
 toggleDisabled(){if(this.form.controls.checkbox.disabled)this.form.enable();else this.form.disable();}
 save(){this.snapshot.set(JSON.stringify(this.form.getRawValue()));this.saved.update(n=>n+1);}
}
