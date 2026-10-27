import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface FlowStep {
  icon: string;
  title: string;
  description: string;
}

@Component({
  imports: [MatButton, MatIcon, RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.scss',
  templateUrl: './landing.html',
})
export class Landing {
  protected readonly auth = inject(AuthService);
  protected readonly repoUrl = 'https://github.com/maansaake/angular-bootstrap';

  protected readonly features: readonly Feature[] = [
    {
      icon: 'bolt',
      title: 'Modern Angular 22',
      description: 'Standalone components, signals, Signal Forms, lazy routes and zoneless.',
      href: 'https://angular.dev/',
    },
    {
      icon: 'palette',
      title: 'Material Design 3',
      description: 'One token-driven theme with light, dark and system modes.',
      href: 'https://material.angular.dev/',
    },
    {
      icon: 'shield_person',
      title: 'Kerberos authentication',
      description: 'HttpOnly cookie sessions, automatic refresh and organisation isolation.',
      href: 'https://github.com/trebent/kerberos',
    },
    {
      icon: 'api',
      title: 'Generated API clients',
      description: 'Typed Angular services generated from OpenAPI specs with one command.',
      href: 'https://openapi-generator.tech/',
    },
    {
      icon: 'rule',
      title: 'ESLint and Prettier',
      description: 'Strict TypeScript, accessibility lint rules and enforced formatting.',
      href: `${this.repoUrl}/blob/main/eslint.config.js`,
    },
    {
      icon: 'deployed_code',
      title: 'CI and GitHub Pages',
      description: 'Every push is formatted, linted, tested, built and deployed.',
      href: `${this.repoUrl}/actions`,
    },
  ];

  protected readonly flow: readonly FlowStep[] = [
    {
      icon: 'person_add',
      title: 'Register',
      description:
        'The app backend creates the user in Kerberos with its hidden admin account, ' +
        'so admin credentials never reach the browser.',
    },
    {
      icon: 'login',
      title: 'Log in',
      description:
        'Kerberos checks the credentials and sets an HttpOnly session cookie that ' +
        'JavaScript cannot read.',
    },
    {
      icon: 'autorenew',
      title: 'Stay logged in',
      description:
        'AuthService refreshes the session every 5 minutes. A 401 triggers one ' +
        'refresh and a retry.',
    },
    {
      icon: 'lan',
      title: 'Call your backend',
      description:
        'Requests go through the Kerberos gateway, which tells your backend who the user ' +
        'is and which organisation they belong to.',
    },
  ];
}
