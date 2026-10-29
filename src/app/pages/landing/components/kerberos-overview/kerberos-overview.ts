import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { environment } from '../../../../../environments/environment';
import { KerberosFlowDiagram } from '../kerberos-flow-diagram/kerberos-flow-diagram';

interface Capability {
  icon: string;
  title: string;
  description: string;
}

interface AuthStep {
  icon: string;
  title: string;
  description: string;
}

/** The landing page's "About Kerberos" section: what it is, how requests flow and how to deploy it. */
@Component({
  imports: [KerberosFlowDiagram, MatIcon],
  selector: 'app-kerberos-overview',
  styleUrl: './kerberos-overview.scss',
  templateUrl: './kerberos-overview.html',
})
export class KerberosOverview {
  protected readonly kerberosUrl = 'https://github.com/trebent/kerberos';
  protected readonly orgId = environment.orgID;

  protected readonly capabilities: readonly Capability[] = [
    {
      icon: 'alt_route',
      title: 'Routes',
      description:
        'Forwards /gw/backend/<name>/<path> to the configured backend, with TLS, CORS and ' +
        'timeouts set per backend.',
    },
    {
      icon: 'key',
      title: 'Authenticates',
      description: 'Owns user accounts and HttpOnly cookie sessions: log in, refresh, log out.',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Authorizes',
      description:
        'Group-based rules for a whole backend or single paths, with users isolated per ' +
        'organisation.',
    },
    {
      icon: 'monitoring',
      title: 'Validates and observes',
      description:
        'Rejects requests that break your OpenAPI contract and traces every call with ' +
        'OpenTelemetry.',
    },
  ];

  protected readonly exampleOrgs = ['A', 'B', 'C'];

  protected readonly authSteps: readonly AuthStep[] = [
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
