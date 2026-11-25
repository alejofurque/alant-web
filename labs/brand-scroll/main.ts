import { bootstrapApplication } from '@angular/platform-browser';
import { BrandStudy } from './study';
import { config } from './study.config';
bootstrapApplication(BrandStudy, config).catch(console.error);
