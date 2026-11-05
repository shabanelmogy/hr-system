import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, readonly } from '@angular/forms/signals';
import { UiTextPipe } from '../../../../../platform/localization/public-api';
import { ActionButton, FormContainer, TextField, StatusBadge } from '../../../../../shared/ui/public-api';
import type { CountryDetail } from '../types/country';

@Component({
  selector: 'erp-country-read-details',
  imports: [FormField, FormContainer, TextField, ActionButton, StatusBadge, UiTextPipe],
  template: `
    <erp-form [form]="form" [title]="'countries.view'|uiText:'reference-countries'"
      [submitLabel]="'actions.view'|uiText" appearance="dialog" [hideHeader]="true" [readOnly]="true" [showSubmit]="false">
      <div class="metadata"><erp-status-badge appearance="outline" [label]="('general.id'|uiText)+': '+country().id" /><erp-status-badge [label]="(country().isDeleted?'countries.status.archived':'countries.status.active')|uiText:'reference-countries'" [accent]="country().isDeleted?'var(--destructive)':'var(--success)'" /></div>
      <div class="names">
      <erp-text-field [formField]="form.nameAr" [label]="'general.nameAr'|uiText" />
      <erp-text-field [formField]="form.nameEn" [label]="'general.nameEn'|uiText" />
      </div>
      <div class="codes">
        <erp-text-field [formField]="form.alpha2Code" [label]="'countries.alpha2Code'|uiText:'reference-countries'" textDirection="ltr" />
        <erp-text-field [formField]="form.alpha3Code" [label]="'countries.alpha3Code'|uiText:'reference-countries'" textDirection="ltr" />
        <erp-text-field [formField]="form.phoneCode" [label]="'countries.phoneCode'|uiText:'reference-countries'" textDirection="ltr" />
        <erp-text-field [formField]="form.currencyCode" [label]="'countries.currencyCode'|uiText:'reference-countries'" textDirection="ltr" />
      </div>
      <erp-button formActions [label]="'actions.close'|uiText" variant="outlined" (activated)="closed.emit()" />
    </erp-form>
  `,
  styles: `.names,.codes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.metadata{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:599px){.names,.codes{grid-template-columns:minmax(0,1fr)}}`,
})
export class CountryReadDetails {
  readonly country = input.required<CountryDetail>();
  readonly closed = output<void>();
  readonly form = form(signal({ nameAr: '', nameEn: '', alpha2Code: '', alpha3Code: '', phoneCode: '', currencyCode: '' }), path => readonly(path));
  constructor() {
    effect(() => {
      const country = this.country();
      this.form().reset({ nameAr: country.nameAr, nameEn: country.nameEn, alpha2Code: country.alpha2Code ?? '', alpha3Code: country.alpha3Code ?? '', phoneCode: country.phoneCode ?? '', currencyCode: country.currencyCode ?? '' });
    });
  }
}
