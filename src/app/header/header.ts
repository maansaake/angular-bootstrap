import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';

@Component({
  imports: [MatToolbar, MatButton, MatIcon, RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly showLogin = signal(false);

  constructor() {
    this.updateShowLogin();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateShowLogin());
  }

  private updateShowLogin(): void {
    const segments = this.router.url.split('?')[0].split('/').filter(Boolean);
    this.showLogin.set(segments.at(-1) !== 'login' && segments.at(-1) !== 'register');
  }

  private onRegister(): void {
    this.router.navigate(['/register']);
  }

  private onLogin(): void {
    this.router.navigate(['/login']);
  }

  private onProfile(): void {
    this.router.navigate(['/profile']);
  }

  private async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['']);
  }
}
