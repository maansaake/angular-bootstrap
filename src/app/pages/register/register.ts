import { Component, inject, signal } from '@angular/core';
import { form, FormField, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { focusFirstInvalid } from '../../utils/forms';
import { Notifier } from '../../services/notifier.service';
import {
  newPasswordRules,
  PASSWORD_LENGTH,
  repeats,
  USERNAME_LENGTH,
  usernameRules,
} from '../../utils/validation';

@Component({
  imports: [FormField, MatButton, MatError, MatFormField, MatHint, MatInput, MatLabel, RouterLink],
  selector: 'app-register',
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly usernameLength = USERNAME_LENGTH;
  protected readonly passwordLength = PASSWORD_LENGTH;
  protected readonly error = signal('');

  protected readonly form = form(
    signal({ username: '', password: '', repeatedPassword: '' }),
    (path) => {
      usernameRules(path.username);
      newPasswordRules(path.password);
      repeats(path.repeatedPassword, path.password);
    },
  );

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');

    await submit(this.form, {
      action: async () => {
        const { username, password } = this.form().value();
        const result = await this.auth.register(username, password);

        if (result.ok) {
          this.notifier.show('Account created. Log in to continue.');
          await this.router.navigateByUrl('/login');
          return undefined;
        }

        if (result.reason === 'conflict') {
          // Server-side errors can be attached to a field, just like client-side ones.
          return {
            kind: 'taken',
            message: 'That username is already taken.',
            fieldTree: this.form.username,
          };
        }

        this.error.set(
          result.reason === 'rate-limited'
            ? 'Too many registrations right now. Please try again in a minute.'
            : 'Registration failed. Please try again.',
        );
        return undefined;
      },
      onInvalid: () =>
        focusFirstInvalid([this.form.username, this.form.password, this.form.repeatedPassword]),
    });
  }
}
