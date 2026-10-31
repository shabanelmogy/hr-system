import { Component,inject,viewChild } from '@angular/core';
import { LocalizationRuntime,UiTextPipe } from '../../../platform/localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { FeedbackNotifications } from '../feedback/feedback-notifications';
import { DialogPanel } from './dialog-panel';
@Component({selector:'erp-error-modal-host',imports:[ActionButton,DialogPanel,UiTextPipe],template:`
 <erp-dialog-panel [open]="!!notices.error()" [title]="locale.translate(notices.error()?.titleKey??'errorDialog.title')" [closeLabel]="'actions.close'|uiText" [manualInitialFocus]="true" icon="close" tone="danger" (shown)="focusClose()" (closeRequested)="notices.dismissError()">
  @if(notices.error();as error){<p class="error-message" role="alert">{{locale.translate(error.key,error.namespace,error.params)}}</p>}
  <erp-button #dismissAction dialogActions [label]="'actions.close'|uiText" (activated)="notices.dismissError()" />
 </erp-dialog-panel>`,styles:'.error-message{margin:0;line-height:1.7;color:var(--foreground);overflow-wrap:anywhere}'})
export class ErrorModalHost {
 readonly notices=inject(FeedbackNotifications);readonly locale=inject(LocalizationRuntime);private readonly closeAction=viewChild<ActionButton>('dismissAction');
 focusClose():void{this.closeAction()?.focus();}
}
