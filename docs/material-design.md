# Material Design Implementation

This document provides a comprehensive guide to the Material Design implementation in the Angular Bootstrap template, covering Material 3 (M3) design system, theming, components, and best practices.

## Overview

The Angular Bootstrap template implements **Angular Material v22 with Material 3 design system**, providing:

- ✅ **Complete Material 3 theming** with customizable palettes
- ✅ **Token-driven styling** using CSS custom properties
- ✅ **Dark mode support** out of the box
- ✅ **Comprehensive component library** for building UIs
- ✅ **Accessibility-first** design patterns
- ✅ **Responsive layout** systems

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Material Design Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Material 3 Design System                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │ │
│  │  │   Color      │  │  Typography  │  │    Elevation       │  │ │
│  │  │  System      │  │  System      │  │    System          │  │ │
│  │  └─────────────┘  └─────────────┘  └───────────────────┘  │ │
│  │                                                                  │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │                    Design Tokens                            │ │ │
│  │  │  --mat-sys-primary, --mat-sys-surface, --mat-sys-error, ... │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Angular Material                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │ │
│  │  │  Components │  │   Theming   │  │   CDK Utilities    │  │ │
│  │  │   (M3)      │  │   (M3)      │  │   (Layout, A11y)   │  │ │
│  │  └─────────────┘  └─────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Angular Application                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │ │
│  │  │  Services    │  │  Components  │  │    Templates      │  │ │
│  │  │  (inject)    │  │   (M3)      │  │   (Material)      │  │ │
│  │  └─────────────┘  └─────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Theme Configuration

### Central Theme File

The **single source of truth** for all theming is `src/styles.scss`:

```scss
// src/styles.scss

// Import Material functions
@use '@angular/material' as mat;

// Define color palettes
$my-primary: mat.define-palette(mat.$magenta-palette, 500, 100, 900);
$my-accent: mat.define-palette(mat.$violet-palette, 500, 100, 900);

// Define the theme
$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    tertiary: $my-accent,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

// Apply the theme globally
@include mat.theme($my-theme);

// Generate system classes for dynamic theming
@include mat.system-classes($my-theme);

// Enable dark mode support
body {
  color-scheme: light dark;
  margin: 0;
  font-family: Roboto, sans-serif;
}
```

### Theme Customization

#### Color Palettes

Angular Material provides built-in palettes:

```scss
// Available palettes
mat.$red-palette
mat.$pink-palette
mat.$purple-palette
mat.$deep-purple-palette
mat.$indigo-palette
mat.$blue-palette
mat.$light-blue-palette
mat.$cyan-palette
mat.$teal-palette
mat.$green-palette
mat.$light-green-palette
mat.$lime-palette
mat.$yellow-palette
mat.$amber-palette
mat.$orange-palette
mat.$deep-orange-palette
mat.$brown-palette
mat.$grey-palette
mat.$blue-grey-palette
```

**Custom palette definition**:
```scss
$custom-primary: (
  50: #e8eaf6,
  100: #c5cae9,
  200: #9fa8da,
  300: #7986cb,
  400: #5c6bc0,
  500: #3f51b5,  // Primary color
  600: #3949ab,
  700: #303f9f,
  800: #283593,
  900: #1a237e,
);

$my-primary: mat.define-palette($custom-primary, 500, 100, 900);
```

#### Theme Variants

**Light Theme** (default):
```scss
$light-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    secondary: $my-secondary,
    tertiary: $my-accent,
  ),
  typography: $typography,
  density: 0,
));
```

**Dark Theme**:
```scss
$dark-theme: mat.define-dark-theme((
  color: (
    primary: $my-primary,
    secondary: $my-secondary,
    tertiary: $my-accent,
  ),
  typography: $typography,
  density: 0,
));
```

#### Multiple Themes

For applications with theme switching:

```scss
// Define both themes
$light-theme: mat.define-light-theme((
  color: (primary: $my-primary, secondary: $my-secondary),
));

$dark-theme: mat.define-dark-theme((
  color: (primary: $my-primary, secondary: $my-secondary),
));

// Apply based on preference
@include mat.theme($light-theme);

.dark-theme {
  @include mat.theme($dark-theme);
}
```

### Typography Configuration

```scss
$typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $headline-1: mat.define-typography-level(32px, 48px, 400),
  $headline-2: mat.define-typography-level(28px, 40px, 400),
  $headline-3: mat.define-typography-level(24px, 36px, 400),
  $headline-4: mat.define-typography-level(20px, 32px, 400),
  $headline-5: mat.define-typography-level(18px, 28px, 400),
  $headline-6: mat.define-typography-level(16px, 24px, 500),
  $subtitle-1: mat.define-typography-level(16px, 24px, 400),
  $subtitle-2: mat.define-typography-level(14px, 24px, 500),
  $body-1: mat.define-typography-level(16px, 24px, 400),
  $body-2: mat.define-typography-level(14px, 24px, 400),
  $caption: mat.define-typography-level(12px, 20px, 400),
  $button: mat.define-typography-level(14px, 14px, 500),
  $input: mat.define-typography-level(inherit, 1.25, 400),
);
```

**Typography Levels**:
- `headline-1` to `headline-6`: Headings (largest to smallest)
- `subtitle-1` and `subtitle-2`: Subtitles
- `body-1` and `body-2`: Body text
- `caption`: Small text
- `button`: Button text
- `input`: Form input text

---

## Design Tokens

### Token System Overview

Material 3 introduces a **token-based theming system** that uses CSS custom properties:

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Hierarchy                              │
├─────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │   Semantic Tokens    │  │   System Tokens      │             │
│  │  (Component-specific)│  │  (Global, reusable)  │             │
│  │                     │  │                      │             │
│  │  --mdc-filled-       │  │  --mat-sys-primary   │             │
│  │  button-container-   │  │  --mat-sys-surface   │             │
│  │  color              │  │  --mat-sys-error     │             │
│  │                     │  │                      │             │
│  └─────────────────────┘  └─────────────────────┘             │
│           ▲                         ▲                              │
│           │                         │                              │
│           └─────────────────────────┘                              │
│                     │                                            │
│           ┌─────────────────────────┐                              │
│           │   Component Tokens      │                              │
│           │  (Internal to Material) │                              │
│           └─────────────────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────┘
```

### System Tokens

**Never use hardcoded colors**. Always use system tokens:

```scss
// ✅ DO - Use system tokens
.my-component {
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  border-color: var(--mat-sys-outline);
  
  &:hover {
    background-color: var(--mat-sys-surface-hover);
  }
}

// ❌ DON'T - Use hardcoded colors
.my-component {
  background-color: #ffffff;  // Avoid
  color: #333333;          // Avoid
  border-color: #cccccc;    // Avoid
}
```

### Available System Tokens

#### Color Tokens

```css
/* Primary palette */
--mat-sys-primary
--mat-sys-on-primary
--mat-sys-primary-container
--mat-sys-on-primary-container
--mat-sys-primary-fixed
--mat-sys-on-primary-fixed
--mat-sys-primary-fixed-dim
--mat-sys-on-primary-fixed-variant

/* Secondary palette */
--mat-sys-secondary
--mat-sys-on-secondary
--mat-sys-secondary-container
--mat-sys-on-secondary-container

/* Tertiary palette */
--mat-sys-tertiary
--mat-sys-on-tertiary
--mat-sys-tertiary-container
--mat-sys-on-tertiary-container

/* Error palette */
--mat-sys-error
--mat-sys-on-error
--mat-sys-error-container
--mat-sys-on-error-container

/* Neutral palette */
--mat-sys-background
--mat-sys-on-background
--mat-sys-surface
--mat-sys-on-surface
--mat-sys-surface-variant
--mat-sys-on-surface-variant
--mat-sys-outline
--mat-sys-outline-variant

/* Surface colors */
--mat-sys-surface-container-highest
--mat-sys-surface-container-high
--mat-sys-surface-container
--mat-sys-surface-container-low
--mat-sys-surface-container-lowest
--mat-sys-surface-dim
--mat-sys-surface-bright
--mat-sys-surface-container

/* Inverse colors */
--mat-sys-inverse-surface
--mat-sys-inverse-on-surface
--mat-sys-inverse-primary

/* Shadow colors */
--mat-sys-shadow
--mat-sys-surface-shadow
```

#### Elevation Tokens

```css
--mat-sys-elevation-level-0
--mat-sys-elevation-level-1
--mat-sys-elevation-level-2
--mat-sys-elevation-level-3
--mat-sys-elevation-level-4
--mat-sys-elevation-level-5
```

#### Opacity Tokens

```css
--mat-sys-disabled-opacity
--mat-sys-secondary-opacity
--mat-sys-tertiary-opacity
```

### Using Tokens in Components

```scss
// my-component.scss

.my-component {
  // Background and text
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  
  // Borders
  border: 1px solid var(--mat-sys-outline);
  
  // Hover states
  &:hover {
    background-color: var(--mat-sys-surface-hover);
  }
  
  // Focus states
  &:focus {
    outline: 2px solid var(--mat-sys-primary);
    outline-offset: 2px;
  }
  
  // Error states
  &.error {
    border-color: var(--mat-sys-error);
    color: var(--mat-sys-on-error);
  }
}
```

---

## Component Library

### Form Controls

Angular Material provides a comprehensive set of form controls that integrate with Angular's Reactive Forms.

#### Text Input

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/form-field';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatInput, MatLabel],
})
export class MyFormComponent {
  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
  });
}
```

```html
<mat-form-field appearance="outline">
  <mat-label>Username</mat-label>
  <input matInput type="text" formControlName="username" />
  <mat-error *ngIf="username.hasError('required')">
    Username is required
  </mat-error>
</mat-form-field>
```

**Appearance Options**:
- `fill` (default) - Filled background
- `outline` - Outlined border
- `standard` - Underline only

#### Form Field Features

**Prefix and Suffix**:
```html
<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <span matPrefix>@</span>
  <input matInput type="email" />
  <span matSuffix>.com</span>
</mat-form-field>
```

**Hint Text**:
```html
<mat-form-field appearance="outline">
  <mat-label>Password</mat-label>
  <input matInput type="password" />
  <mat-hint>Must be at least 10 characters</mat-hint>
</mat-form-field>
```

**Error State Matcher**:
```typescript
// Custom error state matcher
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
```

```html
<mat-form-field appearance="outline" [errorStateMatcher]="matcher">
  <mat-label>Username</mat-label>
  <input matInput formControlName="username" />
  <mat-error>Username is required</mat-error>
</mat-form-field>
```

#### Select

```typescript
import { MatSelect } from '@angular/material/select';

@Component({
  imports: [MatFormField, MatSelect, MatLabel],
})
export class MySelectComponent {
  options = ['Option 1', 'Option 2', 'Option 3'];
}
```

```html
<mat-form-field appearance="outline">
  <mat-label>Choose an option</mat-label>
  <mat-select formControlName="option">
    <mat-option *ngFor="let opt of options" [value]="opt">
      {{ opt }}
    </mat-option>
  </mat-select>
</mat-form-field>
```

#### Checkbox and Radio

```typescript
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  imports: [MatCheckbox, MatRadioModule],
})
export class MyOptionsComponent { }
```

```html
<!-- Checkbox -->
<mat-checkbox formControlName="agree">I agree to the terms</mat-checkbox>

<!-- Radio Group -->
<mat-radio-group formControlName="gender">
  <mat-radio-button value="male">Male</mat-radio-button>
  <mat-radio-button value="female">Female</mat-radio-button>
  <mat-radio-button value="other">Other</mat-radio-button>
</mat-radio-group>
```

#### Datepicker

```typescript
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [MatDatepickerModule, MatInputModule, MatFormField],
})
export class MyDateComponent { }
```

```html
<mat-form-field appearance="outline">
  <mat-label>Choose a date</mat-label>
  <input matInput [matDatepicker]="picker" />
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>
```

### Buttons

```typescript
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [MatButton, MatIcon],
})
export class MyButtonComponent { }
```

```html
<!-- Filled button (primary) -->
<button matButton="filled">Primary Action</button>

<!-- Outlined button -->
<button matButton="outlined">Secondary Action</button>

<!-- Text button -->
<button matButton="text">Text Action</button>

<!-- Icon button -->
<button matButton="icon">
  <mat-icon>favorite</mat-icon>
</button>

<!-- Button with icon -->
<button matButton="filled">
  <mat-icon>save</mat-icon>
  <span>Save</span>
</button>

<!-- Disabled button -->
<button matButton="filled" [disabled]="true">Disabled</button>

<!-- Loading button -->
<button matButton="filled" [disabled]="isLoading">
  <span *ngIf="!isLoading">Submit</span>
  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
</button>
```

### Layout Components

#### Toolbar

```typescript
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  imports: [MatToolbar],
})
export class MyToolbarComponent { }
```

```html
<mat-toolbar color="primary">
  <h1>My Application</h1>
  <span class="spacer"></span>
  <button matButton="text">Menu</button>
</mat-toolbar>
```

```scss
// In component SCSS
.spacer {
  flex: 1 1 auto;
}
```

#### Sidenav

```typescript
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  imports: [MatSidenavModule, MatListModule, MatButton],
})
export class MySidenavComponent {
  opened = false;
}
```

```html
<mat-sidenav-container>
  <mat-sidenav #sidenav mode="side" opened>
    <mat-nav-list>
      <a mat-list-item href="/">Home</a>
      <a mat-list-item href="/about">About</a>
      <a mat-list-item href="/contact">Contact</a>
    </mat-nav-list>
  </mat-sidenav>
  
  <mat-toolbar>
    <button matButton (click)="sidenav.toggle()">
      <mat-icon>menu</mat-icon>
    </button>
    <h1>My App</h1>
  </mat-toolbar>
  
  <main>
    <router-outlet></router-outlet>
  </main>
</mat-sidenav-container>
```

#### Card

```typescript
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatCardModule],
})
export class MyCardComponent { }
```

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
    <mat-card-subtitle>Subtitle</mat-card-subtitle>
  </mat-card-header>
  
  <mat-card-content>
    <p>Card content goes here.</p>
  </mat-card-content>
  
  <mat-card-actions>
    <button matButton="text">Action 1</button>
    <button matButton="text">Action 2</button>
  </mat-card-actions>
</mat-card>
```

#### Divider

```typescript
import { MatDivider } from '@angular/material/divider';

@Component({
  imports: [MatDivider],
})
export class MyDividerComponent { }
```

```html
<div>
  <p>Section 1</p>
  <mat-divider></mat-divider>
  <p>Section 2</p>
</div>

<!-- Vertical divider -->
<div style="display: flex; align-items: center;">
  <span>Left</span>
  <mat-divider [vertical]="true"></mat-divider>
  <span>Right</span>
</div>
```

#### List

```typescript
import { MatListModule } from '@angular/material/list';

@Component({
  imports: [MatListModule],
})
export class MyListComponent {
  items = ['Item 1', 'Item 2', 'Item 3'];
}
```

```html
<mat-list>
  <mat-list-item *ngFor="let item of items">
    <mat-icon matListIcon>check_circle</mat-icon>
    <h3 matLine>{{ item }}</h3>
    <p matLine>Description</p>
  </mat-list-item>
</mat-list>

<!-- Selection list -->
<mat-selection-list #selectionList>
  <mat-list-option *ngFor="let item of items" [value]="item">
    {{ item }}
  </mat-list-option>
</mat-selection-list>
```

### Overlay Components

#### Dialog

```typescript
import { MatDialog } from '@angular/material/dialog';
import { MyDialogComponent } from './my-dialog.component';

@Component({
  // ...
})
export class MyComponent {
  constructor(private dialog: MatDialog) {}
  
  openDialog(): void {
    this.dialog.open(MyDialogComponent, {
      data: { message: 'Hello!' },
      width: '400px',
    });
  }
}
```

```typescript
// my-dialog.component.ts
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  template: `
    <h2 mat-dialog-title>Dialog Title</h2>
    <mat-dialog-content>
      {{ data.message }}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button matButton (click)="onNoClick()">Cancel</button>
      <button matButton [mat-dialog-close]="true">OK</button>
    </mat-dialog-actions>
  `,
})
export class MyDialogComponent {
  dialogRef = inject(MatDialogRef<MyDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
```

#### Snackbar

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  // ...
})
export class MyComponent {
  constructor(private snackBar: MatSnackBar) {}
  
  showMessage(): void {
    this.snackBar.open('Message sent!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
```

#### Tooltip

```typescript
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  imports: [MatTooltip],
})
export class MyTooltipComponent { }
```

```html
<button matButton [matTooltip]="'This is a tooltip'">
  Hover me
</button>

<!-- With positioning -->
<button matButton 
  [matTooltip]="'Tooltip text'"
  matTooltipPosition="above">
  Hover me
</button>
```

#### Menu

```typescript
import { MatMenuModule } from '@angular/material/menu';

@Component({
  imports: [MatMenuModule, MatButton],
})
export class MyMenuComponent { }
```

```html
<button matButton [matMenuTriggerFor]="menu">
  Open Menu
</button>

<mat-menu #menu="matMenu">
  <button mat-menu-item>Option 1</button>
  <button mat-menu-item>Option 2</button>
  <mat-divider></mat-divider>
  <button mat-menu-item>Option 3</button>
</mat-menu>
```

### Data Display

#### Table

```typescript
import { MatTableModule } from '@angular/material/table';

@Component({
  imports: [MatTableModule],
})
export class MyTableComponent {
  displayedColumns: string[] = ['id', 'name', 'action'];
  dataSource = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ];
}
```

```html
<table mat-table [dataSource]="dataSource">
  <!-- ID Column -->
  <ng-container matColumnDef="id">
    <th mat-header-cell *matHeaderCellDef> ID </th>
    <td mat-cell *matCellDef="let element"> {{ element.id }} </td>
  </ng-container>
  
  <!-- Name Column -->
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef> Name </th>
    <td mat-cell *matCellDef="let element"> {{ element.name }} </td>
  </ng-container>
  
  <!-- Action Column -->
  <ng-container matColumnDef="action">
    <th mat-header-cell *matHeaderCellDef> Action </th>
    <td mat-cell *matCellDef="let element">
      <button matButton (click)="onAction(element)">Edit</button>
    </td>
  </ng-container>
  
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

#### Paginator

```typescript
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  imports: [MatPaginatorModule, MatTableModule],
})
export class MyPaginatorComponent {
  // ...
}
```

```html
<table mat-table [dataSource]="dataSource">
  <!-- columns -->
  
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>

<mat-paginator 
  [pageSizeOptions]="[5, 10, 25, 100]"
  showFirstLastButtons>
</mat-paginator>
```

#### Sort

```typescript
import { MatSortModule } from '@angular/material/sort';

@Component({
  imports: [MatSortModule, MatTableModule],
})
export class MySortComponent {
  @ViewChild(MatSort) sort: MatSort;
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
```

```html
<table mat-table [dataSource]="dataSource" matSort>
  <!-- columns -->
  
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

#### Progress Indicators

```typescript
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  imports: [MatProgressSpinner, MatProgressBar],
})
export class MyProgressComponent {
  isLoading = true;
}
```

```html
<!-- Spinner -->
<mat-spinner *ngIf="isLoading"></mat-spinner>

<!-- Spinner with diameter -->
<mat-spinner diameter="40" *ngIf="isLoading"></mat-spinner>

<!-- Progress Bar -->
<mat-progress-bar mode="indeterminate" *ngIf="isLoading"></mat-progress-bar>

<!-- Determinate progress -->
<mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
```

### Navigation

#### Tabs

```typescript
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  imports: [MatTabsModule],
})
export class MyTabsComponent { }
```

```html
<mat-tab-group>
  <mat-tab label="Tab 1">
    <p>Content for Tab 1</p>
  </mat-tab>
  <mat-tab label="Tab 2">
    <p>Content for Tab 2</p>
  </mat-tab>
  <mat-tab label="Tab 3">
    <p>Content for Tab 3</p>
  </mat-tab>
</mat-tab-group>
```

#### Stepper

```typescript
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  imports: [MatStepperModule, MatFormField, MatInput],
})
export class MyStepperComponent {
  firstFormGroup = this.fb.group({ firstCtrl: [''] });
  secondFormGroup = this.fb.group({ secondCtrl: [''] });
}
```

```html
<mat-horizontal-stepper>
  <mat-step [stepControl]="firstFormGroup">
    <form [formGroup]="firstFormGroup">
      <mat-form-field>
        <mat-label>First name</mat-label>
        <input matInput formControlName="firstCtrl" />
      </mat-form-field>
    </form>
    <div>
      <button matButton matStepperNext>Next</button>
    </div>
  </mat-step>
  
  <mat-step [stepControl]="secondFormGroup">
    <form [formGroup]="secondFormGroup">
      <mat-form-field>
        <mat-label>Last name</mat-label>
        <input matInput formControlName="secondCtrl" />
      </mat-form-field>
    </form>
    <div>
      <button matButton matStepperPrevious>Back</button>
      <button matButton matStepperNext>Next</button>
    </div>
  </mat-step>
</mat-horizontal-stepper>
```

---

## Accessibility

Angular Material components are built with accessibility in mind:

### ARIA Attributes

All components include proper ARIA attributes:
- `aria-label` for icons and buttons
- `aria-expanded` for expandable components
- `aria-selected` for selected items
- `aria-disabled` for disabled elements

### Keyboard Navigation

All interactive components support:
- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and controls
- **Arrow Keys**: Navigate within components (menus, selects, etc.)
- **Escape**: Close overlays (dialogs, menus, etc.)

### Focus Management

Components manage focus properly:
- Focus returns to trigger element after overlay closes
- Focus is trapped within dialogs
- Focus indicators are visible

### Screen Reader Support

- All components have proper roles and states
- Live regions for dynamic content
- Proper labeling for form controls

### Best Practices

✅ **Do**: Use semantic HTML
```html
<button matButton>Click me</button>  <!-- Good -->
```

❌ **Don't**: Use divs for interactive elements
```html
<div (click)="onClick()">Click me</div>  <!-- Bad -->
```

✅ **Do**: Provide alt text for images
```html
<img src="..." alt="Description" />
```

✅ **Do**: Use proper labels for form controls
```html
<mat-form-field>
  <mat-label>Username</mat-label>  <!-- Good -->
  <input matInput />
</mat-form-field>
```

❌ **Don't**: Use placeholder as label
```html
<mat-form-field>
  <input matInput placeholder="Username" />  <!-- Bad: No proper label -->
</mat-form-field>
```

✅ **Do**: Use `aria-label` for icon-only buttons
```html
<button matButton aria-label="Close">
  <mat-icon>close</mat-icon>
</button>
```

---

## Responsive Design

### Breakpoints

Angular Material provides a **breakpoint system** via `@angular/cdk/layout`:

```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  // ...
})
export class MyResponsiveComponent {
  constructor(private breakpointObserver: BreakpointObserver) {}
  
  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      for (const query of Object.keys(result.breakpoints)) {
        if (result.breakpoints[query]) {
          console.log(`Matched ${query}`);
        }
      }
    });
  }
}
```

**Breakpoint Constants**:
- `Breakpoints.XSmall`: `(max-width: 599.98px)`
- `Breakpoints.Small`: `(min-width: 600px) and (max-width: 959.98px)`
- `Breakpoints.Medium`: `(min-width: 960px) and (max-width: 1279.98px)`
- `Breakpoints.Large`: `(min-width: 1280px) and (max-width: 1919.98px)`
- `Breakpoints.XLarge`: `(min-width: 1920px)`

### Responsive Layout Patterns

#### Flex Layout

```html
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>
```

```scss
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.item {
  flex: 1 1 200px;  // Flexible, minimum 200px
}

@media (max-width: 600px) {
  .item {
    flex: 1 1 100%;  // Full width on small screens
  }
}
```

#### Grid Layout

```html
<div class="grid-container">
  <div class="grid-item">Item 1</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
</div>
```

```scss
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

#### Sidenav Responsiveness

```html
<mat-sidenav-container>
  <mat-sidenav #sidenav mode="side" opened>
    <!-- Navigation content -->
  </mat-sidenav>
  
  <mat-toolbar>
    <button matButton (click)="sidenav.toggle()" *ngIf="isSmallScreen">
      <mat-icon>menu</mat-icon>
    </button>
    <h1>My App</h1>
  </mat-toolbar>
  
  <main>
    <router-outlet></router-outlet>
  </main>
</mat-sidenav-container>
```

```typescript
isSmallScreen = false;

constructor(private breakpointObserver: BreakpointObserver) {
  this.breakpointObserver.observe(Breakpoints.XSmall)
    .subscribe(result => {
      this.isSmallScreen = result.matches;
      if (this.isSmallScreen) {
        sidenav.mode = 'over';
        sidenav.close();
      } else {
        sidenav.mode = 'side';
        sidenav.open();
      }
    });
}
```

---

## Theming Best Practices

### 1. Single Source of Truth

✅ **Do**: Define theme in one place
```scss
// src/styles.scss - Only place for theme
@include mat.theme($my-theme);
```

❌ **Don't**: Define themes in multiple files
```scss
// Avoid: Theme in component
@include mat.theme($my-theme);  // Bad
```

### 2. Use System Tokens

✅ **Do**: Use system tokens for all colors
```scss
.my-component {
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}
```

❌ **Don't**: Use hardcoded colors
```scss
.my-component {
  background: #ffffff;  // Bad
  color: #333333;    // Bad
}
```

### 3. Respect Color Hierarchy

✅ **Do**: Use appropriate colors for purpose
```scss
// Primary actions
button[matButton="filled"] {
  background: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}

// Secondary actions
button[matButton="outlined"] {
  border-color: var(--mat-sys-outline);
}

// Error states
.error {
  color: var(--mat-sys-error);
}

// Surface colors
.card {
  background: var(--mat-sys-surface);
}
```

❌ **Don't**: Use primary color for everything
```scss
// Bad: Overuse of primary color
button, .card, .text {
  color: var(--mat-sys-primary);  // Too much primary
}
```

### 4. Use Density Consistently

✅ **Do**: Use consistent density
```scss
$my-theme: mat.define-light-theme((
  density: 0,  // 0 = default, -1 = compact, 1 = spacious
));
```

### 5. Dark Mode Support

✅ **Do**: Support dark mode
```scss
body {
  color-scheme: light dark;
}
```

✅ **Do**: Test in dark mode
```html
<!-- In Chrome DevTools: More Tools > Rendering > Emulate CSS media feature prefers-color-scheme -->
```

---

## Component Best Practices

### 1. Import Only What You Need

✅ **Do**: Import specific components
```typescript
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  imports: [MatButton, MatInput],
})
```

❌ **Don't**: Import entire modules
```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

// Avoid: Module imports (use standalone components)
```

### 2. Use Appropriate Appearances

✅ **Do**: Choose appropriate form field appearance
```html
<!-- Outline for most cases -->
<mat-form-field appearance="outline">

<!-- Fill for dense forms -->
<mat-form-field appearance="fill">

<!-- Standard for minimal forms -->
<mat-form-field appearance="standard">
```

### 3. Handle Form Validation

✅ **Do**: Show validation errors
```html
<mat-form-field appearance="outline">
  <mat-label>Username</mat-label>
  <input matInput formControlName="username" />
  
  @if (username.hasError('required') && username.touched) {
  <mat-error>Username is required</mat-error>
  }
  
  @if (username.hasError('minlength') && username.touched) {
  <mat-error>Username must be at least 5 characters</mat-error>
  }
</mat-form-field>
```

### 4. Use Loading States

✅ **Do**: Show loading indicators
```html
<button matButton="filled" [disabled]="isLoading">
  @if (!isLoading) {
    <span>Submit</span>
  } @else {
    <mat-spinner diameter="20"></mat-spinner>
  }
</button>
```

### 5. Use Proper Elevation

✅ **Do**: Use elevation for depth
```html
<!-- Cards have elevation by default -->
<mat-card>...</mat-card>

<!-- Dialogs have elevation -->
<mat-dialog>...</mat-dialog>

<!-- Custom elevation -->
<div class="elevated">
  Content
</div>
```

```scss
.elevated {
  box-shadow: var(--mat-sys-elevation-level-2);
}
```

---

## Performance Tips

### 1. Lazy Load Material Modules

For large applications, consider lazy loading:

```typescript
// In lazy-loaded module
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';

@NgModule({
  imports: [MatButton, MatCard],
})
export class MyLazyModule { }
```

### 2. Use OnPush Change Detection

✅ **Do**: Use OnPush for performance
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent { }
```

### 3. Optimize Imports

✅ **Do**: Import only used components
```typescript
// Good: Specific imports
import { MatButton } from '@angular/material/button';

// Bad: Entire module
import { MatButtonModule } from '@angular/material/button';
```

---

## Testing Material Components

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButton],
      declarations: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Visual Testing

Use tools like:
- **Storybook**: Component library and visual testing
- **Chromatic**: Visual regression testing
- **Percy**: Visual testing service

---

## Migration Guides

### From Material 2 to Material 3

1. **Update dependencies**:
   ```bash
   npm install @angular/material@22 @angular/cdk@22
   ```

2. **Update theme**:
   ```scss
   // Old (M2)
   @include mat-core();
   @include mat.all-component-themes($theme);
   
   // New (M3)
   @include mat.theme($theme);
   @include mat.system-classes($theme);
   ```

3. **Update component appearances**:
   ```html
   <!-- Old -->
   <mat-form-field appearance="fill"></mat-form-field>
   
   <!-- New (M3 uses different styling) -->
   <mat-form-field appearance="outline"></mat-form-field>
   ```

4. **Update color system**:
   ```scss
   // Old (M2)
   $primary: mat-palette($mat-indigo);
   $accent: mat-palette($mat-pink);
   
   // New (M3)
   $primary: mat.define-palette(mat.$indigo-palette);
   $accent: mat.define-palette(mat.$pink-palette);
   ```

---

## Additional Resources

### Documentation
- [Angular Material Official Docs](https://material.angular.io)
- [Material Design Guidelines](https://m3.material.io)
- [Material 3 Design Kit](https://m3.material.io/styles)

### Tools
- [Material Theme Generator](https://material.io/inline-tools/theme/)
- [Material Icons](https://fonts.google.com/icons)
- [Material Color Tool](https://material.io/inline-tools/color/)

### Communities
- [Angular Material GitHub](https://github.com/angular/components)
- [Angular Discord](https://discord.gg/angular)
- [Stack Overflow - Angular Material](https://stackoverflow.com/questions/tagged/angular-material)

---

## Summary

The Material Design implementation in Angular Bootstrap provides:

- ✅ **Complete Material 3 theming** with customizable palettes
- ✅ **Token-driven styling** for consistency and maintainability
- ✅ **Dark mode support** out of the box
- ✅ **Comprehensive component library** for all UI needs
- ✅ **Accessibility-first** design patterns
- ✅ **Responsive layout** systems
- ✅ **Production-ready** patterns and best practices

By following the patterns and best practices outlined in this document, you can build beautiful, accessible, and maintainable Angular applications with Material Design.
