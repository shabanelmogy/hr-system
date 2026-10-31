import { afterNextRender,Component,computed,effect,inject,Injector } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { toastPreset } from '../../../../theme/prime-toast-preset';
import { FeedbackNotifications } from './feedback-notifications';

@Component({selector:'erp-notification-toast',imports:[Toast],providers:[MessageService],template:`<p-toast key="erp-notifications" [position]="locale.direction()==='rtl'?'top-left':'top-right'" [baseZIndex]="10000" [preventOpenDuplicates]="true" [life]="5000" [breakpoints]="{'599px':{width:'calc(100vw - 24px)',left:'12px',right:'12px'}}" [pt]="attributes()" [dt]="tokens" />`})
export class NotificationToast {
 readonly locale=inject(LocalizationRuntime);readonly tokens=toastPreset;
 readonly attributes=computed(()=>({closeButton:{'aria-label':this.locale.translate('actions.close')}}));
 private readonly notices=inject(FeedbackNotifications);private readonly native=inject(MessageService);private readonly injector=inject(Injector);
 constructor(){effect(cleanup=>{
  const pending=this.notices.toasts();if(!pending.length)return;
  const ref=afterNextRender(()=>{if(this.notices.toasts()!==pending)return;this.native.addAll(pending.map(notice=>({key:'erp-notifications',severity:'success',summary:this.locale.translate('messages.success'),detail:this.locale.translate(notice.key,notice.namespace,notice.params),life:5000})));this.notices.delivered(pending.map(notice=>notice.id));},{injector:this.injector});
  cleanup(()=>ref.destroy());
 });}
}
