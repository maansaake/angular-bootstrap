import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/** Asks the user to type their username before deleting their account. Closes with `true`. */
@Component({
  imports: [
    FormField,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
  ],
  selector: 'app-delete-account-dialog',
  template: `
    <h2 mat-dialog-title>Delete your account?</h2>
    <mat-dialog-content>
      <p>
        This permanently deletes <strong>{{ username }}</strong> and logs you out. It cannot be
        undone.
      </p>
      <mat-form-field class="confirmation">
        <mat-label>Type your username to confirm</mat-label>
        <input matInput [formField]="form.confirmation" autocomplete="off" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancel</button>
      <button
        matButton="filled"
        class="danger-button"
        [mat-dialog-close]="true"
        [disabled]="!confirmed()"
      >
        Delete account
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirmation {
      width: 100%;
    }
  `,
})
export class DeleteAccountDialog {
  protected readonly username = inject<string>(MAT_DIALOG_DATA);
  protected readonly form = form(signal({ confirmation: '' }));
  protected readonly confirmed = computed(() => this.form.confirmation().value() === this.username);
}
