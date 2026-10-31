import { Component,inject,signal } from '@angular/core';import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../theme/public-api';import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ActionButton,TextField,NumericField,BooleanField,FormContainer,PageHeader,applyServerFieldErrors } from '../shared/ui/public-api';
@Component({imports:[ReactiveFormsModule,ActionButton,TextField,NumericField,BooleanField,FormContainer,PageHeader,UiTextPipe],template:`
 <main><erp-page-header [title]="'general.value'|uiText" /><div class="tools">
 @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
 <erp-button data-testid="language" [label]="(locale.language()==='en'?'common.arabic':'common.english')|uiText" (activated)="locale.setLanguage(locale.language()==='en'?'ar':'en')" />
 <erp-button data-testid="readonly" [label]="'actions.viewOnly'|uiText" (activated)="readonly.set(!readonly())" />
 <erp-button data-testid="disable" [label]="'common.loading'|uiText" (activated)="toggleDisabled()" />
 <erp-button data-testid="reset" [label]="'general.reset'|uiText" (activated)="reset()" />
 <erp-button data-testid="patch" [label]="'actions.edit'|uiText" (activated)="form.controls.value.setValue('First\\nثاني🙂')" />
 <erp-button data-testid="server-error" [label]="'common.error'|uiText" (activated)="serverError()" />
 <erp-button data-testid="swap" [label]="'actions.gridOptions'|uiText" (activated)="multiline.set(!multiline())" /></div>
 <erp-form data-testid="form" [form]="form" [title]="'general.value'|uiText" [submitLabel]="'actions.save'|uiText" (validSubmit)="save()">
 <erp-text-field data-testid="name" [formControl]="form.controls.name" [label]="'general.nameEn'|uiText" required [messages]="messages()" />
 <erp-text-field data-testid="multiline" [formControl]="form.controls.value" [label]="'general.value'|uiText" [multiline]="multiline()" [rows]="4" [readOnly]="readonly()" [maxLength]="160" [showCounter]="true" required [messages]="messages()" />
 <erp-text-field data-testid="floating" [formControl]="form.controls.optional" [label]="'common.actual'|uiText" multiline appearance="floating" [readOnly]="readonly()" />
 <erp-numeric-field data-testid="numeric" [formControl]="form.controls.number" [label]="'numericField.title'|uiText" multiline />
 <erp-boolean-field data-testid="boolean" [formControl]="form.controls.flag" [label]="'booleanField.checkbox'|uiText" />
 </erp-form><output data-testid="state" [attr.data-value]="form.controls.value.value" [attr.data-saved]="saved()" [attr.data-changes]="changes()" [attr.data-snapshot]="snapshot()">{{snapshot()}}</output></main>`,styles:`main{padding:24px;max-width:1050px;margin:auto}.tools{display:flex;flex-wrap:wrap;gap:8px;margin-block:16px}output{display:block;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--muted-foreground)}@media(max-width:600px){main{padding:16px}}`})
export class MultilinePreview{
 readonly theme=inject(ThemeService);readonly locale=inject(LocalizationRuntime);readonly palettes=themePaletteOrder;readonly readonly=signal(false);readonly multiline=signal(true);readonly saved=signal(0);readonly changes=signal(0);readonly snapshot=signal('');
 readonly form=new FormGroup({name:new FormControl('',{nonNullable:true,validators:Validators.required}),value:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(160)]}),optional:new FormControl('',{nonNullable:true}),number:new FormControl('',{nonNullable:true}),flag:new FormControl(false,{nonNullable:true})});
 constructor(){void this.locale.loadNamespace('core');this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>this.changes.update(n=>n+1));}
 messages(){return{required:this.locale.translate('validation.required'),maxlength:this.locale.translate('validation.maxLength','core',{count:160})};}
 reset(){this.form.reset();this.saved.set(0);this.snapshot.set('');}
 serverError(){applyServerFieldErrors(this.form,{value:this.locale.translate('common.error')});}
 toggleDisabled(){if(this.form.controls.value.disabled)this.form.enable();else this.form.disable();}
 save(){this.snapshot.set(JSON.stringify(this.form.getRawValue()));this.saved.update(n=>n+1);}
}
