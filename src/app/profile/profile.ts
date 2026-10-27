import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { focusFirstInvalid } from '../shared/forms';
import { Notifier } from '../shared/notifier';
import { newPasswordRules, repeats, usernameRules } from '../shared/validation';
import { DeleteAccountDialog } from './delete-account-dialog';

@Component({
  imports: [
    DatePipe,
    FormField,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
  ],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly refreshIntervalMinutes = AuthService.refreshIntervalMs / 60_000;
  protected readonly groups = computed(
    () =>
      this.auth
        .user()
        ?.groups?.map((group) => group.name)
        .join(', ') || 'None',
  );
  protected readonly refreshing = signal(false);

  // Starts out as the current username and follows it when it changes.
  protected readonly usernameForm = form(
    linkedSignal(() => ({ username: this.auth.username() })),
    (path) => usernameRules(path.username),
  );

  protected readonly passwordForm = form(
    signal({ currentPassword: '', newPassword: '', repeatedPassword: '' }),
    (path) => {
      required(path.currentPassword, { message: 'Current password is required.' });
      newPasswordRules(path.newPassword);
      repeats(path.repeatedPassword, path.newPassword);
    },
  );

  protected async refreshSession(): Promise<void> {
    this.refreshing.set(true);
    const refreshed = await firstValueFrom(this.auth.refreshSession());
    this.refreshing.set(false);

    if (refreshed) {
      this.notifier.show('Session refreshed.');
    } else {
      this.notifier.show('Your session has expired. Please log in again.');
      await this.router.navigateByUrl('/login');
    }
  }

  protected async updateUsername(event: Event): Promise<void> {
    event.preventDefault();

    await submit(this.usernameForm, {
      action: async () => {
        const result = await this.auth.updateUsername(this.usernameForm.username().value());

        if (result.ok) {
          this.notifier.show('Username updated.');
          return undefined;
        }

        return {
          kind: 'server',
          message:
            result.reason === 'conflict'
              ? 'That username is already taken.'
              : 'Could not update your username. Please try again.',
          fieldTree: this.usernameForm.username,
        };
      },
      onInvalid: () => focusFirstInvalid([this.usernameForm.username]),
    });
  }

  protected async updatePassword(event: Event): Promise<void> {
    event.preventDefault();
    const fields = this.passwordForm;

    await submit(fields, {
      action: async () => {
        const { currentPassword, newPassword } = fields().value();
        const result = await this.auth.updatePassword(currentPassword, newPassword);

        if (result.ok) {
          fields().reset({ currentPassword: '', newPassword: '', repeatedPassword: '' });
          this.notifier.show('Password updated.');
          return undefined;
        }

        return result.reason === 'invalid'
          ? {
              kind: 'server',
              message: 'Current password is incorrect.',
              fieldTree: fields.currentPassword,
            }
          : {
              kind: 'server',
              message: 'Could not update your password. Please try again.',
              fieldTree: fields.newPassword,
            };
      },
      onInvalid: () =>
        focusFirstInvalid([fields.currentPassword, fields.newPassword, fields.repeatedPassword]),
    });
  }

  protected async deleteAccount(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open<DeleteAccountDialog, string, boolean>(DeleteAccountDialog, {
          data: this.auth.username(),
          maxWidth: '28rem',
        })
        .afterClosed(),
    );
    if (!confirmed) {
      return;
    }

    const result = await this.auth.deleteAccount();
    if (result.ok) {
      this.notifier.show('Your account has been deleted.');
      await this.router.navigateByUrl('/');
    } else {
      this.notifier.show('Could not delete your account. Please try again.');
    }
  }
}
