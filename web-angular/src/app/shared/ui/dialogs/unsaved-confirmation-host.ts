import { Component, inject } from '@angular/core';
import { UnsavedChanges } from '../../data/public-api';
import { UiTextPipe } from '../../../platform/localization/public-api';
import { ConfirmationDialog } from './confirmation-dialog';

@Component({ selector: 'erp-unsaved-confirmation-host', imports: [ConfirmationDialog, UiTextPipe], template: `
  @if (drafts.prompt(); as consent) {
    <erp-confirmation-dialog [open]="true" [title]="'messages.unsavedChangesTitle' | uiText"
      [description]="'messages.unsavedChangesConfirm' | uiText" [cancelLabel]="'actions.cancel' | uiText"
      [confirmLabel]="'messages.discardChanges' | uiText" (cancelled)="drafts.answer(consent, false)" (confirmed)="drafts.answer(consent, true)" />
  }
` })
export class UnsavedConfirmationHost { readonly drafts = inject(UnsavedChanges); }
