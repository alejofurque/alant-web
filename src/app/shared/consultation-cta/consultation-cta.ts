import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Arrow } from '../arrow/arrow';
@Component({
  selector: 'app-consultation-cta',
  imports: [RouterLink, Arrow],
  template: `<section class="consultation dark">
    <div class="container consultation-grid">
      <div>
        <p class="eyebrow" i18n="@@consultation.label">El siguiente paso</p>
        <h2 i18n="@@consultation.title">
          Una buena solución empieza<br />por entender el problema.
        </h2>
      </div>
      <div>
        <p i18n="@@consultation.description">
          No necesitás llegar con una especificación. El contexto de tu empresa es un buen punto de
          partida.
        </p>
        <a routerLink="/contacto" class="button button-primary"
          ><span i18n="@@hero.primaryCta">Hablemos de tu proyecto</span><app-arrow
        /></a>
      </div>
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .consultation {
      padding-block: 80px;
    }
    .consultation-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 12%;
      align-items: center;
    }
    .eyebrow {
      color: var(--color-mint);
      margin-bottom: 20px;
    }
    h2 {
      font-size: clamp(30px, 3.2vw, 46px);
      font-weight: 500;
      line-height: 1.12;
      letter-spacing: -0.04em;
    }
    p:not(.eyebrow) {
      color: var(--color-muted);
      line-height: 1.7;
      margin-bottom: 25px;
    }
    @media (max-width: 760px) {
      .consultation-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      .consultation {
        padding-block: 64px;
      }
    }
  `,
})
export class ConsultationCta {}
