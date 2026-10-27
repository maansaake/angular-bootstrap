import { Component } from '@angular/core';

interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly year = new Date().getFullYear();

  protected readonly builtWith: readonly FooterLink[] = [
    { label: 'Angular', href: 'https://angular.dev/' },
    { label: 'Angular Material', href: 'https://material.angular.dev/' },
    { label: 'Kerberos', href: 'https://github.com/trebent/kerberos' },
    { label: 'OpenAPI Generator', href: 'https://openapi-generator.tech/' },
  ];

  protected readonly project: readonly FooterLink[] = [
    { label: 'Source on GitHub', href: 'https://github.com/maansaake/angular-bootstrap' },
    { label: 'Report an issue', href: 'https://github.com/maansaake/angular-bootstrap/issues' },
    { label: 'More from trebent', href: 'https://github.com/trebent/' },
  ];
}
