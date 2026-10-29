import { Component,computed,inject,signal } from '@angular/core';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { LocalizationRuntime,UiTextPipe } from '../../../../platform/localization/public-api';
import { ActionButton,AppIcon,OptionSelect } from '../../../../shared/ui/public-api';
import { FiscalContextState } from '../state/fiscal-context-state';
@Component({selector:'erp-fiscal-context',imports:[OptionSelect,ActionButton,AppIcon,UiTextPipe],template:`
 @if(state.visible()){
  @if(captions()){
   <erp-option-select appearance="context" commitMode="external" icon="eventNote" [label]="'fiscalYears.context.label'|uiText:'accounting'" [value]="value()" [options]="options()"
    [emptyLabel]="(failed()?'fiscalYears.context.loadError':'fiscalYears.context.noSelection')|uiText:'accounting'" [invalid]="failed()" [busy]="auth.contextChanging()||state.state().kind==='loading'"
    [disabled]="auth.pending()||failed()||!options().length" (valueChange)="state.select(+$event)" />
   @if(failed()){<erp-button appearance="icon" variant="text" [label]="'actions.retry'|uiText" (activated)="state.retry()"><erp-icon buttonIcon name="history" /></erp-button>}
  }@else if(captionError()){<erp-button appearance="icon" variant="text" [label]="'actions.retry'|uiText" (activated)="loadCaptions()"><erp-icon buttonIcon name="history" /></erp-button>}
 }`,styles:':host{display:flex;align-items:center;min-width:0;--context-accent:var(--warning)}'})
export class FiscalContextControl {
 readonly state=inject(FiscalContextState);readonly auth=inject(AuthSession);private readonly locale=inject(LocalizationRuntime);
 readonly captions=signal(false);readonly captionError=signal(false);
 readonly failed=computed(()=>['error','forbidden'].includes(this.state.state().kind));
 readonly value=computed(()=>String(this.state.context()?.selectedFiscalYear?.id??''));
 readonly options=computed(()=>this.state.context()?.availableFiscalYears.map(y=>({value:String(y.id),label:(this.locale.language()==='ar'?y.nameAr:y.nameEn).trim()||(this.locale.language()==='ar'?y.nameEn:y.nameAr).trim()||y.code,description:y.isCurrent?this.locale.translate('fiscalYears.context.companyCurrent','accounting'):y.startDate+' — '+y.endDate}))??[]);
 constructor(){void this.loadCaptions();}
 async loadCaptions(){this.captionError.set(false);try{await this.locale.loadNamespace('accounting');this.captions.set(true);}catch{this.captionError.set(true);}}
}
