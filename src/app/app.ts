import { afterNextRender, Component, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly router = inject(Router);
  constructor() {
    inject(ViewportScroller).setOffset([0, 100]);
    const document = inject(DOCUMENT);
    const injector = inject(Injector);
    let previousPath: string | undefined;
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (!(event instanceof NavigationEnd)) return;
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (previousPath !== undefined && path !== previousPath) {
          afterNextRender(
            () => document.getElementById('contenido')?.focus({ preventScroll: true }),
            { injector },
          );
        }
        previousPath = path;
      });
  }
}
