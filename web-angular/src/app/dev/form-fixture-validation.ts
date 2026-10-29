import { FormControl, FormGroup, Validators } from '@angular/forms';

// Technical compatibility fixture only. Actual feature validators stay with each feature.
export const createAccessFixture = () => new FormGroup({
  email: new FormControl<string | null>('', [Validators.required, Validators.email]),
  password: new FormControl<string | null>('', [Validators.required, Validators.minLength(8)]),
});
export const createProfileFixture = () => new FormGroup({
  profile: new FormGroup({ name: new FormControl<string | null>('Example', Validators.required) }),
});
