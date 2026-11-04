import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiTextPipe } from '../../platform/localization/public-api';
import { UnsavedFixtureState } from '../unsaved-fixture-state';

@Component({
  imports: [RouterLink, UiTextPipe],
  templateUrl: './unsaved-destination.html',
})
export class UnsavedDestination {
  readonly state = inject(UnsavedFixtureState);
}
