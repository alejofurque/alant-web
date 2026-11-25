import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withI18nSupport } from '@angular/platform-browser';
export const config: ApplicationConfig = { providers: [provideClientHydration(withI18nSupport())] };
