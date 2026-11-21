import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

interface GatewayStage {
  title: string;
  description: string;
}

/** A diagram of one request passing from the app, through the Kerberos stages, to the backend. */
@Component({
  imports: [MatIcon],
  selector: 'app-kerberos-flow-diagram',
  styleUrl: './kerberos-flow-diagram.scss',
  templateUrl: './kerberos-flow-diagram.html',
})
export class KerberosFlowDiagram {
  protected readonly stages: readonly GatewayStage[] = [
    { title: 'Observability', description: 'Starts the trace and request metrics' },
    { title: 'Router', description: 'Finds the backend named in the path' },
    { title: 'Auth', description: 'Checks the session cookie and groups' },
    { title: 'Validation', description: 'Checks the request against the OpenAPI spec' },
    { title: 'Forwarder', description: 'Sends it on with identity headers' },
  ];

  protected readonly identityHeaders = ['X-Krb-Org', 'X-Krb-User', 'X-Krb-Groups'];
}
