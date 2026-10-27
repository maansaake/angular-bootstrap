import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideRouter, Router } from '@angular/router';

import { ThemeService } from '../services/theme.service';
import { AuthStub, createAuthStub, provideAuthStub } from '../../testing/auth-stub';
import { expectNoAxeViolations } from '../../testing/axe';
import { Header } from './header';

describe('Header', () => {
  let auth: AuthStub;
  let fixture: ComponentFixture<Header>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    localStorage.clear();
    auth = createAuthStub();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideAuthStub(auth)],
    });

    fixture = TestBed.createComponent(Header);
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    await fixture.whenStable();
  });

  const links = () =>
    Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('nav a')).map((link) =>
      link.textContent?.trim(),
    );

  it('offers registration and log in to guests', async () => {
    expect(links()).toEqual(['Register', 'Log in']);
    await expectNoAxeViolations(fixture);
  });

  it('shows an account menu that logs the user out', async () => {
    auth.setUser({ id: 1, name: 'alice' });
    await fixture.whenStable();
    expect(links()).toEqual([]);
    await expectNoAxeViolations(fixture);

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    const menu = await loader.getHarness(MatMenuHarness.with({ triggerText: /alice/ }));
    await menu.clickItem({ text: /Log out/ });

    expect(auth.logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('switches the color theme', async () => {
    const menu = await loader.getHarness(
      MatMenuHarness.with({ selector: '[aria-label^="Color theme"]' }),
    );
    await menu.clickItem({ text: /Dark/ });

    expect(TestBed.inject(ThemeService).mode()).toBe('dark');
  });
});
