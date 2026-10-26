import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatToolbar } from '@angular/material/toolbar';
import { Footer } from '../footer/footer';

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
    Footer,
  ],
  selector: 'app-landing',
  styleUrl: './landing.scss',
  templateUrl: './landing.html',
})
export class Landing {
  readonly authService = inject(AuthService);

  features = [
    {
      icon: 'build',
      title: 'Modern Angular 22',
      description: 'Standalone components, signals, and modern control flow',
      link: '/',
      requiresAuth: false,
    },
    {
      icon: 'design_services',
      title: 'Material Design 3',
      description: 'Complete Material 3 theming with token-driven styling',
      link: 'https://material.angular.io/',
      requiresAuth: false,
    },
    {
      icon: 'verified_user',
      title: 'Kerberos Authentication',
      description: 'Secure session management with HttpOnly cookies',
      link: 'https://github.com/trebent/kerberos',
      requiresAuth: false,
    },
    {
      icon: 'api',
      title: 'OpenAPI Codegen',
      description: 'Type-safe API clients generated from OpenAPI specs',
      link: 'https://openapi-generator.tech/',
      requiresAuth: false,
    },
    {
      icon: 'check_circle',
      title: 'ESLint & Prettier',
      description: 'Production-ready linting and formatting',
      link: '/',
      requiresAuth: false,
    },
    {
      icon: 'github',
      title: 'GitHub Actions CI',
      description: 'Complete CI/CD pipeline with build, test, and lint',
      link: 'https://github.com/maansaake/angular-bootstrap/actions',
      requiresAuth: false,
    },
  ];
}
