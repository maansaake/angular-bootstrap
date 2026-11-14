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
  templateUrl: './delete-account-dialog.html',
  styleUrl: './delete-account-dialog.scss',
})
export class DeleteAccountDialog {
  protected readonly username = inject<string>(MAT_DIALOG_DATA);
  protected readonly form = form(signal({ confirmation: '' }));
  protected readonly confirmed = computed(() => this.form.confirmation().value() === this.username);
}
