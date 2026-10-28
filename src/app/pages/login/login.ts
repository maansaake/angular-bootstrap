import { Component, inject, input, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { focusFirstInvalid, safeReturnUrl } from '../../utils/forms';
import { Notifier } from '../../services/notifier.service';

@Component({
  imports: [FormField, MatButton, MatError, MatFormField, MatInput, MatLabel, RouterLink],
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

  protected readonly form = form(signal({ username: '', password: '' }), (path) => {
    required(path.username, { message: 'Username is required.' });
    required(path.password, { message: 'Password is required.' });
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');

    await submit(this.form, {
      action: async () => {
        const { username, password } = this.form().value();
        const result = await this.auth.login(username, password);

        if (!result.ok) {
          this.error.set(
            result.reason === 'unauthorized'
              ? 'Invalid username or password.'
              : 'Could not log in. Please try again.',
          );
          return undefined;
        }

        this.notifier.show(`Welcome back, ${username}.`);
        await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
        return undefined;
      },
      onInvalid: () => focusFirstInvalid([this.form.username, this.form.password]),
    });
  }
}
