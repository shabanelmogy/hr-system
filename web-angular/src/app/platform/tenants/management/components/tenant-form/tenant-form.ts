import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionButton,
  AppIcon,
  ContentTabs,
  FormContainer,
  FormSection,
  FeedbackState,
  ScrollViewport,
  type ContentTab,
} from '../../../../../shared/ui/public-api';
import { TenantAdminsPage } from '../../../../tenant-admins/public-api';
import { UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';
import { TenantIdentityFields } from '../tenant-identity-fields/tenant-identity-fields';
import { TenantSubscriptionFields } from '../tenant-subscription-fields/tenant-subscription-fields';
import { TenantEntitlementField } from '../tenant-entitlement-field/tenant-entitlement-field';

const sectionIds = ['identity', 'subscription', 'entitlements', 'administrators'] as const;
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
    TenantEntitlementField,
    NgTemplateOutlet,
    ScrollViewport,
    FeedbackState,
    TenantAdminsPage,
  ],
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.scss',
  host: { '[class.page-composition]': "appearance()==='page'" },
})
export class TenantForm {
  readonly tenantId = input<string | null>(null);
  readonly administratorsOpened = signal(false);
  readonly appearance = input<'page' | 'dialog'>('page');
  readonly cancelled = output<void>();
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
  readonly selected = linkedSignal<TenantSection>(() => {
    this.editor.identity();
    return 'identity';
  });
  readonly tabs = computed<readonly ContentTab[]>(() =>
    sectionIds.map((id) => ({
      id,
      label:
        id === 'administrators'
          ? this.captions.locale.translate('tenantAdmins.title', 'platform-tenants')
          : this.captions.text('tabs.' + id),
    })),
  );
  private readonly container = viewChild(FormContainer);
  constructor() {
    this.editor.errorsChanged
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.container()?.revealErrors());
  }
  chooseSection(id: string): void {
    const section = sectionIds.find((section) => section === id);
    if (section) {
      if (section === 'administrators') this.administratorsOpened.set(true);
      this.selected.set(section);
    }
  }
}
