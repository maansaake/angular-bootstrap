import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { form, FormField, FormRoot, required, TreeValidationResult } from '@angular/forms/signals';
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

import { Skeleton } from '../../components/skeleton/skeleton';
import { AuthService } from '../../services/auth.service';
import { Notifier } from '../../services/notifier.service';
import { focusFirstInvalid } from '../../utils/forms';
import { newPasswordRules, repeats, usernameRules } from '../../utils/validation';
import { DeleteAccountDialog } from './components/delete-account-dialog/delete-account-dialog';

@Component({
  imports: [
    DatePipe,
    FormField,
    FormRoot,
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
    Skeleton,
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
  /** The full user record, fetched each time the page opens. Shows skeletons until it lands. */
  protected readonly profile = resource({ loader: () => this.auth.fetchProfile() });
  protected readonly groups = computed(
    () =>
      (this.profile.hasValue() ? this.profile.value() : this.auth.user())?.groups
        ?.map((group) => group.name)
        .join(', ') || 'None',
  );
  protected readonly refreshing = signal(false);

  // Starts out as the current username and follows it when it changes.
  protected readonly usernameForm = form(
    linkedSignal(() => ({ username: this.auth.username() })),
    (path) => usernameRules(path.username),
    {
      submission: {
        action: async () => this.updateUsername(),
        onInvalid: () => focusFirstInvalid([this.usernameForm.username]),
      },
    },
  );

  protected readonly passwordForm = form(
    signal({ currentPassword: '', newPassword: '', repeatedPassword: '' }),
    (path) => {
      required(path.currentPassword, { message: 'Current password is required.' });
      newPasswordRules(path.newPassword);
      repeats(path.repeatedPassword, path.newPassword);
    },
    {
      submission: {
        action: async () => this.updatePassword(),
        onInvalid: () =>
          focusFirstInvalid([
            this.passwordForm.currentPassword,
            this.passwordForm.newPassword,
            this.passwordForm.repeatedPassword,
          ]),
      },
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

  private async updateUsername(): Promise<TreeValidationResult> {
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
  }

  private async updatePassword(): Promise<TreeValidationResult> {
    const fields = this.passwordForm;
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
