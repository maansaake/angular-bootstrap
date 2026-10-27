export * from './account.service';
import { AccountService } from './account.service';
export * from './registration.service';
import { RegistrationService } from './registration.service';
export const APIS = [AccountService, RegistrationService];
