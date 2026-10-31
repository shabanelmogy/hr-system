import { Component, computed, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { UiTextPipe } from '../../../platform/localization/public-api';
import { ConfirmationDialog } from '../dialogs/confirmation-dialog';
import { LocalCloseController, type CloseConsent } from './local-close-controller';

/** Local close only. The owner must supply semantic unsaved state and every draft revision. */
@Component({
  selector: 'erp-form-close-guard', imports: [ConfirmationDialog, UiTextPipe],
  template: `
    @for (consent of prompts(); track consent.token) {
      <erp-confirmation-dialog [open]="true" [title]="'messages.unsavedChangesTitle' | uiText"
        [description]="'messages.unsavedChangesConfirm' | uiText" [cancelLabel]="'actions.cancel' | uiText"
        [confirmLabel]="'messages.discardChanges' | uiText" (cancelled)="keep(consent)" (confirmed)="discard(consent)" />
    }
  `,
})
export class FormCloseGuard {
  readonly identity = input.required<string>();
  readonly revision = input.required<number>();
  readonly active = input(true);
  readonly unsaved = input(false);
  readonly pending = input(false);
  readonly closed = output<CloseConsent>();
  private readonly controller = new LocalCloseController();
  private readonly snapshot = computed(() => ({ identity: this.identity(), revision: this.revision(), active: this.active(), unsaved: this.unsaved(), pending: this.pending() }));
  readonly prompts = signal<readonly CloseConsent[]>([]);
  constructor() {
    effect(() => { const state = this.snapshot(); untracked(() => this.refresh(this.controller.synchronize(state))); });
    inject(DestroyRef).onDestroy(() => this.controller.destroy());
  }
  requestClose(): void {
    const current = this.snapshot();
    if (this.controller.request(current)) this.closed.emit({ identity: current.identity, revision: current.revision, token: 0 });
    this.refresh(this.controller.consent());
  }
  keep(consent: CloseConsent): void { this.controller.keep(consent); this.refresh(this.controller.consent()); }
  discard(consent: CloseConsent): void {
    if (this.controller.confirm(this.snapshot(), consent)) this.closed.emit(consent);
    this.refresh(this.controller.consent());
  }
  private refresh(consent: CloseConsent | null): void {
    if (this.prompts()[0] !== consent && !(this.prompts().length === 0 && consent === null)) this.prompts.set(consent ? [consent] : []);
  }
}
