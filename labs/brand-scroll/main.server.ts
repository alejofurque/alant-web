import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode } from '@angular/ssr';
import { BrandStudy } from './study';
import { config } from './study.config';
export default (context: BootstrapContext) =>
  bootstrapApplication(
    BrandStudy,
    mergeApplicationConfig(config, {
      providers: [
        provideServerRendering(withRoutes([{ path: '**', renderMode: RenderMode.Prerender }])),
      ],
    }),
    context,
  );
