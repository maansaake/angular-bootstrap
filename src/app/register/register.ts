import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
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
import { Router } from '@angular/router';

import { ErrorStateMatcher } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationService } from '../services/backend';

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

  return password === repeatedPassword ? null : { passwordsMismatch: true };
};

@Component({
  imports: [ReactiveFormsModule, MatButton, MatError, MatFormField, MatInput, MatLabel],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly registrationService = inject(RegistrationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly registerError = signal<string | null>(null);

  // Field constraints mirror the backend's register endpoint (see openapi/backend.yaml).
  readonly registerForm = this.fb.nonNullable.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(32),
        ],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(40)],
      ],
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

      return shouldShowError && (controlIsInvalid || passwordsDoNotMatch);
    },
  };

  onSubmit(): void {
    this.registerError.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.registerForm.getRawValue();

    // Registration is owned by the app backend (openapi/backend.yaml): it proxies user
    // creation to Kerberos with its hidden admin account. Login afterwards goes straight
    // to Kerberos.
    this.registrationService.register({ username, password }).subscribe({
      next: () => {
        this.snackBar.open(`Registered successfully.`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        this.registerError.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? 'Username is already taken.'
            : 'Registration failed. Please try again.',
        );
      },
    });
  }
}
