import { Component, input, output, type TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { UiTextPipe } from '../../../localization/public-api';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';
@Component({
  selector: 'erp-collection-feedback',
  imports: [NgTemplateOutlet, FeedbackState, UiTextPipe],
  templateUrl: './collection-feedback.html',
})
export class CollectionFeedback {
  readonly kind = input.required<'ready' | 'loading' | 'error' | 'forbidden'>();
  readonly emptyTemplate = input<TemplateRef<object>>();
  readonly retry = output<void>();
  feedbackKind() {
    const kind = this.kind();
    return kind === 'ready' ? 'empty' : kind;
  }
}
