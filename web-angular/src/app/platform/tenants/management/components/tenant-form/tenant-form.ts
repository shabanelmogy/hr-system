import { Component, computed, inject, input, linkedSignal, output, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionButton,
  AppIcon,
  ContentTabs,
  FormContainer,
  FormSection,
  type ContentTab,
} from '../../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';
import { TenantIdentityFields } from '../tenant-identity-fields/tenant-identity-fields';
import { TenantSubscriptionFields } from '../tenant-subscription-fields/tenant-subscription-fields';
import { TenantContactFields } from '../tenant-contact-fields/tenant-contact-fields';
import { TenantNotesFields } from '../tenant-notes-fields/tenant-notes-fields';
import { TenantEntitlementField } from '../tenant-entitlement-field/tenant-entitlement-field';

const sectionIds = ['identity', 'subscription', 'contact', 'entitlements', 'notes'] as const;
type TenantSection = (typeof sectionIds)[number];

@Component({
  selector: 'erp-tenant-form',
  providers: [TenantFormPresentation],
  imports: [
    FormField,
    ActionButton,
    AppIcon,
    ContentTabs,
    FormContainer,
    FormSection,
    UiTextPipe,
    TenantIdentityFields,
    TenantSubscriptionFields,
    TenantContactFields,
    TenantNotesFields,
    TenantEntitlementField,
  ],
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.scss',
  host: { '[class.page-composition]': "appearance()==='page'" },
})
export class TenantForm {
  readonly appearance = input<'page' | 'dialog'>('page');
  readonly cancelled = output<void>();
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
  readonly selected = linkedSignal<TenantSection>(() => {
    this.editor.identity();
    return 'identity';
  });
  readonly tabs = computed<readonly ContentTab[]>(() =>
    sectionIds.map((id) => ({ id, label: this.captions.text('tabs.' + id) })),
  );
  private readonly container = viewChild(FormContainer);
  constructor() {
    this.editor.errorsChanged
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.container()?.revealErrors());
  }
  chooseSection(id: string): void {
    const section = sectionIds.find((section) => section === id);
    if (section) this.selected.set(section);
  }
}
