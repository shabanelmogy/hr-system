import { Component, input, output } from '@angular/core';
import { ActionButton } from '../action-button/action-button';
import { AppIcon } from '../../icons/app-icon/app-icon';

@Component({
  imports: [ActionButton, AppIcon],
  selector: 'erp-back-button',
  styleUrl: './back-button.scss',
  templateUrl: './back-button.html',
})
export class BackButton {
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly activated = output<void>();
}
