import { FieldTree } from '@angular/forms/signals';

/** Moves focus to the first invalid field, so keyboard users land on what needs fixing. */
export function focusFirstInvalid(fields: readonly FieldTree<string>[]): void {
  fields
    .find((field) => field().invalid())?.()
    .focusBoundControl();
}

/** Only follow same-app paths, never `//evil.example` or absolute URLs, to avoid open redirects. */
export function safeReturnUrl(url: string | undefined, fallback = '/'): string {
  return url?.startsWith('/') && !url.startsWith('//') ? url : fallback;
}
