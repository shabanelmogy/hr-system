import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalHost, NotificationToast, UnsavedConfirmationHost } from './shared/ui/public-api';
import { FeedbackNotifications } from './shared/ui/feedback/notifications.public-api';
import { UnsavedChanges, UnsavedNavigation } from './shared/data/navigation.public-api';

@Component({
  imports: [RouterOutlet, UnsavedConfirmationHost, NotificationToast, ErrorModalHost],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(UnsavedNavigation);
  }
  readonly drafts = inject(UnsavedChanges);
  readonly notifications = inject(FeedbackNotifications);
}
