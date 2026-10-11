import { Component, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from '../services/user';
import { MatButton } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  imports: [MatToolbarModule, MatButton, RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private readonly userSvc = inject(User);
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

  private onLogout(): void {
    this.userSvc.logout();
    this.router.navigate([''])
  }
}
