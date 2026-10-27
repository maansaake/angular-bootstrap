import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthStub, createAuthStub, provideAuthStub } from '../../testing/auth-stub';
import { expectNoAxeViolations } from '../../testing/axe';
import { Profile } from './profile';

describe('Profile', () => {
  let auth: AuthStub;
  let fixture: ComponentFixture<Profile>;
  let loader: HarnessLoader;
  let rootLoader: HarnessLoader;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = createAuthStub({ id: 7, name: 'alice', groups: [{ id: 1, name: 'staff' }] });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAuthStub(auth),
        // Close dialogs immediately instead of waiting for their exit animation.
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(Profile);
    loader = TestbedHarnessEnvironment.loader(fixture);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    await fixture.whenStable();
  });

  const field = (label: string) =>
    loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: label }));
  const input = async (label: string) =>
    (await (await field(label)).getControl(MatInputHarness)) as MatInputHarness;
  const click = async (text: string) => {
    await (await rootLoader.getHarness(MatButtonHarness.with({ text }))).click();
    await fixture.whenStable();
  };

  it('shows the Kerberos session', async () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('alice');
    expect(text).toContain('staff');
    expect(text).toContain('Every 5 minutes');
    await expectNoAxeViolations(fixture);
  });

  it('starts with the current username and saves a new one', async () => {
    const username = await input('Username');
    expect(await username.getValue()).toBe('alice');

    await username.setValue('alice2');
    await click('Update username');

    expect(auth.updateUsername).toHaveBeenCalledWith('alice2');
  });

  it('marks a wrong current password on its field', async () => {
    auth.updatePassword.mockResolvedValue({ ok: false, reason: 'invalid' });
    await (await input('Current password')).setValue('wrong password');
    await (await input('New password')).setValue('battery staple horse');
    await (await input('Repeat new password')).setValue('battery staple horse');
    await click('Update password');

    expect(auth.updatePassword).toHaveBeenCalledWith('wrong password', 'battery staple horse');
    expect(await (await field('Current password')).getTextErrors()).toEqual([
      'Current password is incorrect.',
    ]);
  });

  it('deletes the account only after the username is typed', async () => {
    await click('Delete account…');
    const dialog = await rootLoader.getHarness(MatDialogHarness);
    const confirm = await dialog.getHarness(MatButtonHarness.with({ text: 'Delete account' }));
    expect(await confirm.isDisabled()).toBe(true);

    await (await dialog.getHarness(MatInputHarness)).setValue('alice');
    await confirm.click();
    await fixture.whenStable();

    expect(auth.deleteAccount).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
