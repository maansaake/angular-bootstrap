import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { Register } from './register/register';

@Component({
  imports: [RouterOutlet, Login, Profile, Register],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('sample');
}
