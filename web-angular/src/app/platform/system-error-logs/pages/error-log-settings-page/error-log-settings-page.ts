import { Component, inject } from '@angular/core';
import { PageHeader, FeedbackState, ScrollViewport } from '../../../../shared/ui/public-api';
import { ErrorLogSettingsState } from '../../state/error-log-settings-state';
import { RetentionEditorState } from '../../state/retention-editor-state';
import { RetentionPresentation } from '../../presentation/retention-presentation';
import { RetentionSummary } from '../../components/retention-summary/retention-summary';
import { RetentionEditor } from '../../components/retention-editor/retention-editor';

@Component({
  selector: 'erp-error-log-settings-page',
  imports: [PageHeader, FeedbackState, ScrollViewport, RetentionSummary, RetentionEditor],
  providers: [ErrorLogSettingsState, RetentionEditorState, RetentionPresentation],
  templateUrl: './error-log-settings-page.html',
  styleUrl: './error-log-settings-page.scss',
})
export class ErrorLogSettingsPage {
  readonly reads = inject(ErrorLogSettingsState);
  readonly captions = inject(RetentionPresentation);
  constructor() {
    void this.captions.locale.loadNamespace('core');
    void this.captions.locale.loadNamespace('platform-advanced-tools');
  }
}
