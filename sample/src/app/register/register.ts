import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


/**
 * Validates that the password and repeated password match.
 * This validator belongs on the FormGroup because it compares
 * two sibling controls.
 */
const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const repeatedPassword = control.get('repeatedPassword')?.value;

  // Let the required validators handle empty fields.
  if (!password || !repeatedPassword) {
    return null;
  }

  return password === repeatedPassword
    ? null
    : { passwordsMismatch: true };
};

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly userSvc = inject(User);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly registerForm = this.fb.nonNullable.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(32),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(5)]],
      repeatedPassword: ['', Validators.required],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  get username() {
    return this.registerForm.controls.username;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get repeatedPassword() {
    return this.registerForm.controls.repeatedPassword;
  }

  readonly repeatedPasswordMatcher: ErrorStateMatcher = {
    isErrorState: (
      control: AbstractControl | null,
      form: FormGroupDirective | NgForm | null,
    ): boolean => {
      const shouldShowError = !!(control?.touched || form?.submitted);
      const controlIsInvalid = !!control?.invalid;
      const passwordsDoNotMatch = !!control?.parent?.hasError(
        'passwordsMismatch',
      );

      return (
        shouldShowError &&
        (controlIsInvalid || passwordsDoNotMatch)
      );
    },
  };

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.registerForm.getRawValue();

    this.userSvc.register(username, password);
    this.router.navigate(['']);

    this.snackBar.open(
      `Registered successfully.`,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      },
    );
  }
}
