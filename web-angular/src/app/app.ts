import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ErrorModalHost,
  NotificationToast,
  UnsavedConfirmationHost,
  ResponsivePreviewHost,
} from './shared/ui/public-api';
import { ResponsivePreviewState } from './shared/ui/diagnostics/state.public-api';
import { FeedbackNotifications } from './shared/ui/feedback/notifications.public-api';
import { UnsavedChanges, UnsavedNavigation } from './shared/data/navigation.public-api';
import { LocalizationRuntime } from './platform/localization/presentation.public-api';

@Component({
  imports: [
    RouterOutlet,
    UnsavedConfirmationHost,
    NotificationToast,
    ErrorModalHost,
    ResponsivePreviewHost,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(UnsavedNavigation);
    if (inject(ResponsivePreviewState).standalone) {
      void inject(LocalizationRuntime).loadNamespace('core');
    }
  }
  readonly drafts = inject(UnsavedChanges);
  readonly notifications = inject(FeedbackNotifications);
  readonly preview = inject(ResponsivePreviewState);
}
