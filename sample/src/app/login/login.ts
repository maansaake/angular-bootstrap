import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly userSvc = inject(User);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loginError = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  clearLoginError(): void {
    this.loginError.set(null);
  }

  onSubmit(): void {
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    if (this.userSvc.login(username, password)) {
      this.snackBar.open(
        `Logged in successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        },
      );
      this.router.navigate(['']);
    } else {
      this.loginError.set('Invalid username or password.');
    }
  }
}
