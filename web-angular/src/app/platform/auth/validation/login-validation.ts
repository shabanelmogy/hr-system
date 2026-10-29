import { FormControl, FormGroup, Validators, type ValidatorFn } from '@angular/forms';

const trimmedUsername: ValidatorFn = control => {
  const value: unknown = control.value;
  const username = typeof value === 'string' ? value.trim() : '';
  return !username ? { required: true } : username.length < 3 ? { minlength: { requiredLength: 3 } } : username.length > 50 ? { maxlength: { requiredLength: 50 } } : null;
};
const trimmedRequired: ValidatorFn = control => typeof control.value === 'string' && control.value.trim() ? null : { required: true };
export const createLoginForm = () => new FormGroup({ username: new FormControl('', { nonNullable: true, validators: trimmedUsername }), password: new FormControl('', { nonNullable: true, validators: trimmedRequired }) });
export const createPasswordRequestForm = () => new FormGroup({ email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }) });
