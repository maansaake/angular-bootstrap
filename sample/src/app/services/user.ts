import { inject, Service, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuard: CanActivateFn = () => {
  const authService = inject(User);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  return router.navigate(['/login']);
};

@Service()
export class User {
  private readonly router = inject(Router);

  username = signal<string>("");
  loggedIn = signal<boolean>(false);

  constructor() {
    const status = localStorage.getItem("loggedIn");
    if (status != null) {
      this.loggedIn.set(true);
      this.username.set(localStorage.getItem("username")!);
    }
  }

  register(username: string, password: string): boolean {
    localStorage.setItem(username, password);

    this.router.navigate(['/login']);

    return true;
  }

  updateUsername(newUsername: string): boolean {
    const password = localStorage.getItem(this.username())!;
    localStorage.removeItem(this.username());
    localStorage.setItem(newUsername, password);
    localStorage.setItem("username", newUsername);
    this.username.set(newUsername);

    return true;
  }

  updatePassword(currentPassword: string, newPassword: string): boolean {
    const password = localStorage.getItem(this.username());

    if (currentPassword != password) {
      return false
    }

    localStorage.setItem(this.username(), newPassword);

    return true;
  }

  login(username: string, password: string): boolean {
    const storedPassword = localStorage.getItem(username);
    if (storedPassword == null) {
      return false;
    }

    if (storedPassword != password) {
      return false;
    }

    this.loggedIn.set(true);
    this.username.set(username);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", username);
    return true;
  }

  logout(): void {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    this.loggedIn.set(false);
  }
}
