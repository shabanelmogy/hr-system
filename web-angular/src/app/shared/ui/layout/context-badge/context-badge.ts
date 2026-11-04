import { Component, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-context-badge',
  imports: [AppIcon, Tooltip],
  templateUrl: './context-badge.html',
  styleUrl: './context-badge.scss',
})
export class ContextBadge {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<AppIconName>();
}
