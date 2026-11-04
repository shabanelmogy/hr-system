import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonGroup } from 'primeng/buttongroup';

@Component({
  imports: [ButtonGroup],
  selector: 'erp-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './action-button-group.scss',
  templateUrl: './action-button-group.html',
})
export class ActionButtonGroup {
  readonly label = input.required<string>();
}
