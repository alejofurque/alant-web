import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-intro',
  imports: [RouterLink],
  template: `<header class="page-intro dark">
    <div class="container">
      <nav class="breadcrumb eyebrow" aria-label="Ubicación" i18n-aria-label="@@page.breadcrumb">
        <a routerLink="/" i18n="@@page.home">Inicio</a><span aria-hidden="true">/</span
        ><span aria-current="page">{{ label() }}</span>
      </nav>
      <div class="intro-grid">
        <div>
          <p class="eyebrow intro-index">{{ code() }} / ALANT</p>
          <h1>
            {{ title() }} <span>{{ accent() }}</span>
          </h1>
        </div>
        <div class="intro-aside">
          <p>{{ description() }}</p>
          <ng-content />
        </div>
      </div>
      <div class="intro-rule" aria-hidden="true">
        <span>ALANT / Software Engineering Studio</span><span>↘</span>
      </div>
    </div>
  </header>`,
  styleUrl: './page-intro.css',
})
export class PageIntro {
  readonly label = input.required<string>();
  readonly code = input.required<string>();
  readonly title = input.required<string>();
  readonly accent = input('');
  readonly description = input.required<string>();
}
