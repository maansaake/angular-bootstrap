import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthStub, createAuthStub, provideAuthStub } from '../../../testing/auth-stub';
import { expectNoAxeViolations } from '../../../testing/axe';
import { Login } from './login';

describe('Login', () => {
  let auth: AuthStub;
  let fixture: ComponentFixture<Login>;
  let loader: HarnessLoader;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = createAuthStub();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideAuthStub(auth)] });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  const input = (autocomplete: string) =>
    loader.getHarness(MatInputHarness.with({ selector: `[autocomplete="${autocomplete}"]` }));
  const submit = async () => {
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Log in' }))).click();
    await fixture.whenStable();
  };
  const errors = async () =>
    Promise.all(
      (await loader.getAllHarnesses(MatFormFieldHarness)).map((field) => field.getTextErrors()),
    );

  async function fillIn(username: string, password: string) {
    await (await input('username')).setValue(username);
    await (await input('current-password')).setValue(password);
  }

  it('requires both fields and focuses the first one', async () => {
    await submit();

    expect((await errors()).flat()).toEqual(['Username is required.', 'Password is required.']);
    expect(document.activeElement?.getAttribute('autocomplete')).toBe('username');
    expect(auth.login).not.toHaveBeenCalled();
    await expectNoAxeViolations(fixture);
  });

  it('logs in and goes to the requested page', async () => {
    fixture.componentRef.setInput('returnUrl', '/profile');
    await fillIn('alice', 'correct horse battery');
    await submit();

    expect(auth.login).toHaveBeenCalledWith('alice', 'correct horse battery');
    expect(navigate).toHaveBeenCalledWith('/profile');
  });

  it('never redirects off-site', async () => {
    fixture.componentRef.setInput('returnUrl', '//evil.example');
    await fillIn('alice', 'correct horse battery');
    await submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('announces rejected credentials', async () => {
    auth.login.mockResolvedValue({ ok: false, reason: 'unauthorized' });
    await fillIn('alice', 'wrong');
    await submit();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Invalid username or password.');
    expect(navigate).not.toHaveBeenCalled();
    await expectNoAxeViolations(fixture);
  });
});
