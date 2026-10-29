import { TestBed } from '@angular/core/testing';

import { expectNoAxeViolations } from '../../../../../testing/axe';
import { KerberosOverview } from './kerberos-overview';

describe('KerberosOverview', () => {
  async function render() {
    const fixture = TestBed.createComponent(KerberosOverview);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('explains Kerberos under its own heading', async () => {
    const element = await render();

    expect(element.querySelector('h2')?.textContent).toContain('Kerberos');
    expect(element.querySelector('a[href="https://github.com/trebent/kerberos"]')).not.toBeNull();
  });

  it('describes both deployment modes', async () => {
    const element = await render();
    const modes = [...element.querySelectorAll('.mode h4')].map((h) => h.textContent);

    expect(modes).toHaveLength(2);
    expect(modes[0]).toContain('Multi-tenant');
    expect(modes[1]).toContain('Single-tenant');
  });

  it('has no axe violations', async () => {
    const fixture = TestBed.createComponent(KerberosOverview);
    await expectNoAxeViolations(fixture);
  });
});
