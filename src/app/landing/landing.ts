import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatToolbar } from '@angular/material/toolbar';

import { AuthService } from '../services/auth.service';

@Component({
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatDivider,
    MatIcon,
    MatList,
    MatListItem,
    MatToolbar,
    RouterLink,
  ],
  selector: 'app-landing',
  styleUrl: './landing.scss',
  templateUrl: './landing.html',
})
export class Landing {
  readonly authService = inject(AuthService);

  features = [
    {
      icon: 'design_services',
      title: 'Material Design 3',
      description: 'Complete Material 3 theming with token-driven styling',
      link: '/profile',
      requiresAuth: true,
    },
    {
      icon: 'verified_user',
      title: 'Kerberos Authentication',
      description: 'Secure session management with HttpOnly cookies',
      link: '/login',
      requiresAuth: false,
    },
    {
      icon: 'api',
      title: 'OpenAPI Codegen',
      description: 'Type-safe API clients generated from OpenAPI specs',
      link: '/profile',
      requiresAuth: true,
    },
    {
      icon: 'build',
      title: 'Modern Angular 22',
      description: 'Standalone components, signals, and modern control flow',
      link: '/profile',
      requiresAuth: true,
    },
    {
      icon: 'check_circle',
      title: 'ESLint & Prettier',
      description: 'Production-ready linting and formatting',
      link: '/profile',
      requiresAuth: true,
    },
    {
      icon: 'github',
      title: 'GitHub Actions CI',
      description: 'Complete CI/CD pipeline with build, test, and lint',
      link: '/profile',
      requiresAuth: true,
    },
  ];

  quickActions = [
    {
      icon: 'person_add',
      title: 'Register',
      description: 'Create a new account',
      link: '/register',
      color: 'primary',
    },
    {
      icon: 'login',
      title: 'Log In',
      description: 'Sign in to your account',
      link: '/login',
      color: 'accent',
    },
    {
      icon: 'account_circle',
      title: 'Profile',
      description: 'View and edit your profile',
      link: '/profile',
      color: 'warn',
      requiresAuth: true,
    },
  ];

  get visibleQuickActions() {
    return this.quickActions.filter(
      action => !action.requiresAuth || this.authService.loggedIn()
    );
  }

  get visibleFeatures() {
    return this.features.filter(
      feature => !feature.requiresAuth || this.authService.loggedIn()
    );
  }
}
