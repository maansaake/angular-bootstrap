import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: string;
}

@Component({
  imports: [
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatToolbar,
    RouterLink,
  ],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  protected readonly themeOptions: readonly ThemeOption[] = [
    { mode: 'system', label: 'System', icon: 'brightness_auto' },
    { mode: 'light', label: 'Light', icon: 'light_mode' },
    { mode: 'dark', label: 'Dark', icon: 'dark_mode' },
  ];

  protected readonly currentTheme = computed(
    () =>
      this.themeOptions.find((option) => option.mode === this.theme.mode()) ?? this.themeOptions[0],
  );

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
