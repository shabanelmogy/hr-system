import { Component,input,output,TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { UiTextPipe } from '../../../platform/localization/public-api';
import { FeedbackState } from '../feedback/feedback-state';
@Component({selector:'erp-collection-feedback',imports:[NgTemplateOutlet,FeedbackState,UiTextPipe],template:`
 @if(kind()==='ready'&&emptyTemplate();as template){<ng-container *ngTemplateOutlet="template" />}
 @else{<erp-feedback-state [kind]="feedbackKind()" [title]="(kind()==='loading'?'common.loading':kind()==='ready'?'pagination.noData':kind()==='forbidden'?'authorization.forbidden.title':'common.error')|uiText" [actionLabel]="kind()==='error'?('actions.retry'|uiText):''" (action)="retry.emit()" />}
 `})
export class CollectionFeedback {
 readonly kind=input.required<'ready'|'loading'|'error'|'forbidden'>();readonly emptyTemplate=input<TemplateRef<object>>();readonly retry=output<void>();
 feedbackKind(){const kind=this.kind();return kind==='ready'?'empty':kind;}
}
