import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UnsavedFixtureState {
  readonly alive = signal(0);
  readonly stopped = signal(0);
}
