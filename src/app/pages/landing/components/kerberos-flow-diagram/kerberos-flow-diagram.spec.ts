import { TestBed } from '@angular/core/testing';

import { expectNoAxeViolations } from '../../../../../testing/axe';
import { KerberosFlowDiagram } from './kerberos-flow-diagram';

describe('KerberosFlowDiagram', () => {
  it('shows every gateway stage in order', async () => {
    const fixture = TestBed.createComponent(KerberosFlowDiagram);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const stages = [...element.querySelectorAll('.stage-title')].map((s) => s.textContent?.trim());

    expect(stages).toEqual(['Observability', 'Router', 'Auth', 'Validation', 'Forwarder']);
    expect(element.querySelector('figcaption')?.textContent).toContain('session cookie');
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(TestBed.createComponent(KerberosFlowDiagram));
  });
});
