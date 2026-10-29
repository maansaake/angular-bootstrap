import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { KerberosOverview } from './components/kerberos-overview/kerberos-overview';

interface Feature {
  icon: string;
  title: string;
  description: string;
  href: string;
}

@Component({
  imports: [KerberosOverview, MatButton, MatIcon, RouterLink],
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
      description: 'HttpOnly cookie sessions, automatic refresh and multi-tenancy.',
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
}
