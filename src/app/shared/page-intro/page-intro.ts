import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Dark page opening shared by inner pages: breadcrumb, H1, lede and a measured rule. */
@Component({
  selector: 'app-page-intro',
  imports: [RouterLink],
  template: `<header class="intro">
    <div class="wrap">
      <nav class="crumbs" aria-label="Ubicación" i18n-aria-label="@@page.breadcrumb">
        <a routerLink="/" i18n="@@page.home">Inicio</a><span aria-hidden="true">/</span
        ><span aria-current="page">{{ label() }}</span>
      </nav>
      <div class="intro-grid">
        <div>
          <p class="kicker">{{ code() }} — {{ label() }}</p>
          <h1>
            <span class="line"
              ><span>{{ title() }} </span></span
            >
            @if (accent()) {
              <span class="line accent"
                ><span>{{ accent() }}</span></span
              >
            }
          </h1>
        </div>
        <div class="intro-aside">
          <p class="intro-lede">{{ description() }}</p>
          <ng-content />
        </div>
      </div>
      <div class="ruler" aria-hidden="true">
        <span class="ruler-fill"></span>
        <span class="ruler-label">ALANT · {{ code() }}</span>
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
