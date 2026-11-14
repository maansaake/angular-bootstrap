import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputHarness } from '@angular/material/input/testing';

import { expectNoAxeViolations } from '../../../../../testing/axe';
import { DeleteAccountDialog } from './delete-account-dialog';

describe('DeleteAccountDialog', () => {
  let fixture: ComponentFixture<DeleteAccountDialog>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: 'alice' },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(DeleteAccountDialog);
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  const deleteButton = () => loader.getHarness(MatButtonHarness.with({ text: 'Delete account' }));

  it('names the account and keeps delete disabled until the username is typed', async () => {
    expect(fixture.nativeElement.textContent).toContain('alice');
    expect(await (await deleteButton()).isDisabled()).toBe(true);

    const input = await loader.getHarness(MatInputHarness);
    await input.setValue('alic');
    expect(await (await deleteButton()).isDisabled()).toBe(true);

    await input.setValue('alice');
    expect(await (await deleteButton()).isDisabled()).toBe(false);
    await expectNoAxeViolations(fixture);
  });
});
