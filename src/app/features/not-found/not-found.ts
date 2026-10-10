import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Arrow } from '../../shared/arrow/arrow';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Arrow],
  template: `<section class="dark">
    <div class="container missing">
      <span class="eyebrow" i18n="@@notFound.label">404 / Dirección no encontrada</span>
      <h1 i18n="@@notFound.heading">Esta pieza no está<br />en el sistema.</h1>
      <p i18n="@@notFound.copy">
        La dirección puede haber cambiado o no existir. Podés volver al inicio o conocer lo que
        podemos construir.
      </p>
      <div class="actions">
        <a class="button button-primary" routerLink="/"
          ><span i18n="@@notFound.home">Volver al inicio</span><app-arrow /></a
        ><a class="text-link" routerLink="/servicios" i18n="@@notFound.services"
          >Explorar servicios ↗</a
        >
      </div>
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .missing {
      padding-block: 100px 130px;
      min-height: 65vh;
    }
    .eyebrow {
      color: var(--color-mint);
    }
    h1 {
      font-size: clamp(42px, 6vw, 80px);
      font-weight: 500;
      line-height: 1.05;
      letter-spacing: -0.05em;
      margin-block: 30px;
    }
    p {
      max-width: 520px;
      color: var(--color-muted);
      line-height: 1.8;
    }
    .actions {
      display: flex;
      gap: 25px;
      flex-wrap: wrap;
      margin-top: 35px;
    }
  `,
})
export class NotFound {}
