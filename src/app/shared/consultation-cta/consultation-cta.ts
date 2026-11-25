import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Arrow } from '../arrow/arrow';

/** Mint closing band for inner pages, the same last step as the home. */
@Component({
  selector: 'app-consultation-cta',
  imports: [RouterLink, Arrow],
  template: `<section class="consultation" aria-labelledby="consultation-title">
    <div class="wrap consultation-grid">
      <p class="kicker" i18n="@@consultation.label">El siguiente paso</p>
      <h2 id="consultation-title" i18n="@@consultation.titleV2">
        Una buena solución empieza por
        <span class="measure">entender</span> el problema.
      </h2>
      <div class="consultation-side">
        <p i18n="@@consultation.description">
          No necesitás llegar con una especificación. El contexto de tu empresa es un buen punto de
          partida.
        </p>
        <a routerLink="/contacto" class="cta-solid ink"
          ><span i18n="@@hero.primaryCta">Hablemos de tu proyecto</span><app-arrow
        /></a>
      </div>
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
      background: var(--color-mint);
      color: var(--color-graphite);
    }
    :focus-visible {
      outline: 2px solid var(--color-graphite);
      outline-offset: 4px;
    }
    .consultation {
      padding-block: clamp(88px, 11vw, 156px);
    }
    .consultation-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 30px;
    }
    h2 {
      max-width: 13em;
      margin: 0;
      font-size: clamp(40px, 5.4vw, 86px);
      font-weight: 500;
      line-height: 0.98;
      letter-spacing: -0.058em;
      text-wrap: balance;
    }
    p:not(.kicker) {
      max-width: 26em;
      margin: 0 0 28px;
      font-size: 18px;
      line-height: 1.55;
    }
    @media (min-width: 1000px) {
      .consultation-grid {
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
        column-gap: clamp(40px, 5vw, 96px);
        align-items: end;
      }
      .kicker {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class ConsultationCta {}
