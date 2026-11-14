import { Component, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Notifier } from '../../services/notifier.service';
import { focusFirstInvalid, safeReturnUrl } from '../../utils/forms';

@Component({
  imports: [FormField, FormRoot, MatButton, MatError, MatFormField, MatInput, MatLabel, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** Where to go after logging in; set by `authGuard` and bound from the query string. */
  readonly returnUrl = input<string>();

  protected readonly error = signal('');

  protected readonly form = form(
    signal({ username: '', password: '' }),
    (path) => {
      required(path.username, { message: 'Username is required.' });
      required(path.password, { message: 'Password is required.' });
    },
    {
      submission: {
        action: async () => this.logIn(),
        onInvalid: () => focusFirstInvalid([this.form.username, this.form.password]),
      },
    },
  );

  private async logIn(): Promise<void> {
    this.error.set('');
    const { username, password } = this.form().value();
    const result = await this.auth.login(username, password);

    if (!result.ok) {
      this.error.set(
        result.reason === 'unauthorized'
          ? 'Invalid username or password.'
          : 'Could not log in. Please try again.',
      );
      return;
    }

    this.notifier.show(`Welcome back, ${username}.`);
    await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }
}
