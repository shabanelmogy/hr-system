import { Component,computed,inject,input,output,viewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../../theme/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon,type AppIconName } from '../icons/app-icon';
import { UiTextPipe } from '../../../platform/localization/public-api';
import { StatusBadge } from '../feedback/status-badge';
import { PopoverPanel } from '../overlays/popover-panel';

export interface PageViewOption {readonly id:string;readonly label:string;readonly icon:AppIconName;}
export interface PageHeaderAction {readonly label:string;readonly icon:AppIconName;readonly disabled?:boolean;}
export function partitionPageViews(options:readonly PageViewOption[],active:string,limit:number):{readonly visible:readonly PageViewOption[];readonly overflow:readonly PageViewOption[]}{
 const count=Math.max(1,Math.floor(limit));if(options.length<=count)return {visible:options,overflow:[]};const visible=options.slice(0,count),selected=options.find(option=>option.id===active);
 if(selected&&!visible.some(option=>option.id===active))visible[visible.length-1]=selected;
 return {visible,overflow:options.filter(option=>!visible.some(item=>item.id===option.id))};
}
@Component({selector:'erp-page-header',imports:[ActionButton,AppIcon,UiTextPipe,StatusBadge,PopoverPanel],
 host:{'[class.collection-header]':"variant()==='collection'"},template:`
 <header>
  <div class="title-block"><h1>{{title()}}</h1>
   @if(variant()!=='collection'&&subtitle()){<p>{{subtitle()}}</p>}
  </div>
  @if(variant()==='collection'){
   <div class="header-badges"><erp-status-badge class="total-badge" appearance="outline" accent="var(--primary)" [pill]="true" size="medium" [strong]="false" [label]="countLabel()" /><erp-status-badge class="view-badge" [softOpacity]="theme.mode()==='dark'?18:8" [pill]="true" size="medium" [strong]="false" [label]="selectedLabel()" accent="var(--primary)" /></div>
  }
  <div class="header-controls"><div class="header-actions">
   @if(primaryAction();as action){<erp-button class="primary-action" [label]="action.label" [title]="action.label" [disabled]="action.disabled??false" [appearance]="compactAction()?'icon':'default'" (activated)="primaryActivated.emit()"><erp-icon buttonIcon [name]="action.icon" /></erp-button>}
   <ng-content />
   @if(variant()==='collection'){
    @if(refreshable()){<erp-button class="refresh" [label]="'navigation.refresh'|uiText" appearance="icon" variant="text" (activated)="refresh.emit()"><erp-icon buttonIcon name="refresh" /></erp-button>}
    @if(filterable()){<erp-button class="filter" [label]="'navigation.filter'|uiText" appearance="icon" variant="text" [pressed]="filterVisible()" (activated)="filterToggle.emit()"><erp-icon buttonIcon name="filter" /></erp-button>}
   }
  </div>
  @if(variant()==='collection'){
   <span class="header-divider" aria-hidden="true"></span>
   <div class="view-toggles" role="group" [attr.aria-label]="'navigation.viewType'|uiText">
    @for(option of viewOptions().visible;track option.id){<erp-button [attr.data-view]="option.id" [label]="option.label" [title]="option.label" [pressed]="view()===option.id" appearance="toggle" variant="outlined" (activated)="selectView(option.id)"><erp-icon buttonIcon [name]="option.icon" /></erp-button>}
    @if(viewOptions().overflow.length){<erp-popover-panel #moreViews [label]="'navigation.moreViews'|uiText"><erp-icon popoverTrigger name="more" /><div class="overflow-views">@for(option of viewOptions().overflow;track option.id){<erp-button [label]="option.label" appearance="quiet" variant="text" (activated)="selectView(option.id)"><erp-icon buttonIcon [name]="option.icon" /></erp-button>}</div></erp-popover-panel>}
   </div>
  }
  </div>
 </header>`,styleUrl:'./page-header.scss'})
export class PageHeader {
 readonly theme=inject(ThemeService);
 private readonly breakpoint=toSignal(inject(BreakpointObserver).observe(['(min-width:900px)','(max-width:599px)']),{initialValue:{matches:true,breakpoints:{'(min-width:900px)':true,'(max-width:599px)':false}}});
 private readonly moreViews=viewChild<PopoverPanel>('moreViews');
 readonly title=input.required<string>();readonly subtitle=input('');readonly variant=input<'simple'|'collection'>('simple');
 readonly views=input<readonly PageViewOption[]>([]);readonly view=input('grid');readonly total=input(0);readonly totalLabel=input('');
 readonly refreshable=input(true);readonly filterable=input(true);readonly filterVisible=input(true);
 readonly primaryAction=input<PageHeaderAction|null>(null);readonly primaryActivated=output<void>();
 readonly compactAction=computed(()=>this.breakpoint().breakpoints['(max-width:599px)']===true);
 readonly viewChange=output<string>();readonly refresh=output<void>();readonly filterToggle=output<void>();
 readonly selectedLabel=computed(()=>this.views().find(option=>option.id===this.view())?.label??'');
 readonly countLabel=computed(()=>String(this.total())+(this.totalLabel()?' '+this.totalLabel():''));
 readonly viewOptions=computed(()=>{const viewport=this.breakpoint();return viewport.breakpoints['(min-width:900px)']?{visible:this.views(),overflow:[]}:partitionPageViews(this.views(),this.view(),viewport.breakpoints['(max-width:599px)']?2:3);});
 selectView(id:string){if(id!==this.view()&&this.views().some(option=>option.id===id)){this.moreViews()?.close();this.viewChange.emit(id);}}
}
