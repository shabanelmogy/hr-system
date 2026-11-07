import { Component, inject } from '@angular/core';
import {
  ActionButton,
  FeedbackState,
  FileField,
  IdentityAvatar,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AccountProfileState } from '../../state/account-profile-state';

@Component({
  selector: 'erp-account-photo-editor',
  imports: [ActionButton, FeedbackState, FileField, IdentityAvatar, UiTextPipe],
  templateUrl: './photo-editor.html',
  styleUrl: './photo-editor.scss',
})
export class PhotoEditor {
  readonly state = inject(AccountProfileState);
  readonly locale = inject(LocalizationRuntime);
  text(key: string): string {
    return this.locale.translate('accountProfile.' + key, 'platform-auth');
  }
}
