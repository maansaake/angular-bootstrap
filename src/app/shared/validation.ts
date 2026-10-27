import {
  maxLength,
  minLength,
  PathKind,
  required,
  SchemaPath,
  SchemaPathRules,
  validate,
} from '@angular/forms/signals';

type StringPath<K extends PathKind> = SchemaPath<string, SchemaPathRules.Supported, K>;

// Limits mirror the backend's register endpoint and Kerberos (see openapi/).
export const USERNAME_LENGTH = { min: 5, max: 32 } as const;
export const PASSWORD_LENGTH = { min: 10, max: 40 } as const;

export function usernameRules<K extends PathKind>(path: StringPath<K>): void {
  required(path, { message: 'Username is required.' });
  minLength(path, USERNAME_LENGTH.min, {
    message: `Username must be at least ${USERNAME_LENGTH.min} characters.`,
  });
  maxLength(path, USERNAME_LENGTH.max, {
    message: `Username cannot exceed ${USERNAME_LENGTH.max} characters.`,
  });
}

export function newPasswordRules<K extends PathKind>(path: StringPath<K>): void {
  required(path, { message: 'Password is required.' });
  minLength(path, PASSWORD_LENGTH.min, {
    message: `Password must be at least ${PASSWORD_LENGTH.min} characters.`,
  });
  maxLength(path, PASSWORD_LENGTH.max, {
    message: `Password cannot exceed ${PASSWORD_LENGTH.max} characters.`,
  });
}

/** Requires `path` to repeat the value of `original`, e.g. a "repeat password" field. */
export function repeats<K extends PathKind>(path: StringPath<K>, original: StringPath<K>): void {
  required(path, { message: 'Please repeat the password.' });
  validate(path, ({ value, valueOf }) =>
    value() && value() !== valueOf(original)
      ? { kind: 'mismatch', message: 'Passwords do not match.' }
      : undefined,
  );
}
