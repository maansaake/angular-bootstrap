import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthStub, createAuthStub, provideAuthStub } from '../../testing/auth-stub';
import { expectNoAxeViolations } from '../../testing/axe';
import { Landing } from './landing';

describe('Landing', () => {
  let auth: AuthStub;

  beforeEach(() => {
    auth = createAuthStub();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideAuthStub(auth)] });
  });

  async function render() {
    const fixture = TestBed.createComponent(Landing);
    await fixture.whenStable();
    return fixture;
  }

  it('invites guests to try the demo', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Start your next Angular app');
    expect(element.querySelector('a[href="/register"]')).not.toBeNull();
    await expectNoAxeViolations(fixture);
  });

  it('welcomes signed-in users back', async () => {
    auth.setUser({ id: 1, name: 'alice' });
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Welcome back, alice');
    expect(element.querySelector('a[href="/profile"]')).not.toBeNull();
    await expectNoAxeViolations(fixture);
  });

  it('gives every feature card a named link', async () => {
    const fixture = await render();
    const cards = fixture.nativeElement.querySelectorAll('.feature') as NodeListOf<HTMLElement>;

    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) =>
      expect(card.querySelector('a[href]')?.textContent?.trim()).toBeTruthy(),
    );
  });
});
