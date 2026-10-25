import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroupDirective, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../services/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ErrorStateMatcher } from '@angular/material/core';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const repeatedPassword = control.get('repeatedPassword')?.value;

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
    MatDividerModule,
  ],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly userSvc = inject(User);
  private readonly snackBar = inject(MatSnackBar);

  readonly usernameForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(32),
      ],
    ],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
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

      return (
        shouldShowError &&
        (controlIsInvalid || passwordsDoNotMatch)
      );
    },
  };

  get username() {
    return this.usernameForm.controls.username;
  }

  onUsernameSubmit(): void {
    if (this.usernameForm.invalid) {
      this.usernameForm.markAllAsTouched();
      return;
    }

    const { username } = this.usernameForm.getRawValue();

    this.userSvc.updateUsername(username);
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
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } =
      this.passwordForm.getRawValue();


    if (this.userSvc.updatePassword(currentPassword, newPassword)) {
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
