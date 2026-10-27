import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthStub, createAuthStub, provideAuthStub } from '../../testing/auth-stub';
import { expectNoAxeViolations } from '../../testing/axe';
import { Register } from './register';

describe('Register', () => {
  let auth: AuthStub;
  let fixture: ComponentFixture<Register>;
  let loader: HarnessLoader;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = createAuthStub();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideAuthStub(auth)] });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(Register);
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  const field = (label: string) =>
    loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: label }));

  async function fillIn(username: string, password: string, repeated = password) {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    await inputs[0].setValue(username);
    await inputs[1].setValue(password);
    await inputs[2].setValue(repeated);
  }

  async function submit() {
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Create account' }))).click();
    await fixture.whenStable();
  }

  it('validates lengths and the repeated password', async () => {
    await fillIn('al', 'short', 'different');
    await submit();

    expect(await (await field('Username')).getTextErrors()).toEqual([
      'Username must be at least 5 characters.',
    ]);
    expect(await (await field('Password')).getTextErrors()).toEqual([
      'Password must be at least 10 characters.',
    ]);
    expect(await (await field('Repeat password')).getTextErrors()).toEqual([
      'Passwords do not match.',
    ]);
    expect(auth.register).not.toHaveBeenCalled();
    await expectNoAxeViolations(fixture);
  });

  it('registers and sends the user to log in', async () => {
    await fillIn('alice', 'correct horse battery');
    await submit();

    expect(auth.register).toHaveBeenCalledWith('alice', 'correct horse battery');
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('shows a taken username on the username field', async () => {
    auth.register.mockResolvedValue({ ok: false, reason: 'conflict' });
    await fillIn('alice', 'correct horse battery');
    await submit();

    expect(await (await field('Username')).getTextErrors()).toEqual([
      'That username is already taken.',
    ]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('explains rate limiting', async () => {
    auth.register.mockResolvedValue({ ok: false, reason: 'rate-limited' });
    await fillIn('alice', 'correct horse battery');
    await submit();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Too many registrations',
    );
  });
});
