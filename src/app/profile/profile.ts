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
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../services/auth.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const repeatedPassword = control.get('repeatedPassword')?.value;

  if (!password || !repeatedPassword) {
    return null;
  }

  return password === repeatedPassword ? null : { passwordsMismatch: true };
};

@Component({
  imports: [ReactiveFormsModule, MatButton, MatDivider, MatError, MatFormField, MatInput, MatLabel],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly usernameForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(32),
      ],
    ],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(10)]],
      repeatedPassword: ['', Validators.required],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  get currentPassword() {
    return this.passwordForm.controls.currentPassword;
  }

  get newPassword() {
    return this.passwordForm.controls.newPassword;
  }

  get repeatedPassword() {
    return this.passwordForm.controls.repeatedPassword;
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

  get username() {
    return this.usernameForm.controls.username;
  }

  async onUsernameSubmit(): Promise<void> {
    if (this.usernameForm.invalid) {
      this.usernameForm.markAllAsTouched();
      return;
    }

    const { username } = this.usernameForm.getRawValue();

    if (await this.authService.updateUsername(username)) {
      this.usernameForm.reset();

      this.snackBar.open(
        `Your username has been updated successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        },
      );
    } else {
      this.snackBar.open(`Failed to update your username.`, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  async onPasswordSubmit(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    if (await this.authService.updatePassword(currentPassword, newPassword)) {
      this.passwordForm.reset();

      this.snackBar.open(
        'Your password has been updated successfully.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        },
      );
    } else {
      this.currentPassword.setErrors({ incorrect: true });
    }
  }
}
