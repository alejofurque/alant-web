import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MotionPreferences } from '../../../core/motion/motion-preferences';
import type { Escultura as EsculturaEscena } from './escena-a';

/**
 * Escultura 3D del hero. El HTML prerenderizado muestra una imagen fija de la misma pieza; la escena
 * real (Three.js, en un chunk aparte) se monta después sin bloquear la carga y la reemplaza con un
 * fundido. Con movimiento reducido o sin WebGL2 queda la imagen fija.
 */
@Component({
  selector: 'app-escultura',
  template: `
    <img
      class="poster"
      src="/escultura/alant-a-1200.webp"
      srcset="
        /escultura/alant-a-600.webp   600w,
        /escultura/alant-a-800.webp   800w,
        /escultura/alant-a-1200.webp 1200w
      "
      sizes="(min-width: 1100px) 52vw, 92vw"
      alt=""
      width="1200"
      height="1260"
      decoding="async"
      fetchpriority="high"
      [class.oculto]="lista()"
    />
    <canvas #lienzo class="lienzo" [class.visible]="lista()"></canvas>
    <p class="nota" i18n="@@escultura.nota"><span>Pieza A</span> Estudio de forma · 3D</p>
  `,
  styleUrl: './escultura.css',
  host: { 'aria-hidden': 'true' },
})
export class Escultura {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private readonly preferencias = inject(MotionPreferences);
  readonly lista = signal(false);
  private escena?: EsculturaEscena;
  private enPantalla = true;
  private cargando = false;
  private destruido = false;
  private readonly limpiezas: (() => void)[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destruido = true;
      this.limpiezas.forEach((f) => f());
      this.escena?.destruir();
    });

    afterNextRender(() => {
      // Se monta con el primer gesto real (mover el mouse, tocar, rueda o teclado): en escritorio
      // ocurre enseguida, y la carga inicial y sus métricas quedan libres de Three.js.
      alPrimerGesto(() => this.cargar(), this.limpiezas);
    });

    // Movimiento reducido (sistema o interruptor del sitio): vuelve a la imagen fija.
    effect(() => {
      const reducido = this.preferencias.ready() && this.preferencias.reduced();
      if (!this.escena) return;
      this.lista.set(!reducido);
      this.escena.pausar(reducido || !this.enPantalla);
    });
  }

  private async cargar(): Promise<void> {
    if (this.cargando || this.destruido || this.preferencias.reduced()) return;
    this.cargando = true;
    try {
      const { montarEscultura } = await import('./escena-a');
      if (this.destruido) return;
      const compacto = innerWidth < 1100;
      this.escena = await montarEscultura(this.lienzo().nativeElement, {
        compacto,
        quieto: false,
      });
      if (this.destruido) return void this.escena.destruir();
      this.conectar(compacto);
      this.lista.set(!this.preferencias.reduced());
    } catch (error) {
      // Sin WebGL2 (o si algo falla) la imagen fija ya cuenta la pieza: se deja como está.
      // No se sondea WebGL al hidratar: crear un contexto arranca la GPU y bloquea el hilo principal.
      console.warn('[escultura] no se pudo montar la escena 3D', error);
    }
  }

  private conectar(compacto: boolean): void {
    const escena = this.escena!;
    const host = this.host.nativeElement;
    const hero = host.closest<HTMLElement>('.hero') ?? host;

    const medir = new ResizeObserver(([e]) =>
      escena.medir(e.contentRect.width, e.contentRect.height),
    );
    medir.observe(this.lienzo().nativeElement);

    const visible = new IntersectionObserver(([e]) => {
      this.enPantalla = e.isIntersecting;
      escena.pausar(!this.enPantalla || this.preferencias.reduced());
    });
    visible.observe(host);

    // Al salir del hero la pieza se desarma: 0 con el hero entero, 1 cuando ya pasó.
    const alScroll = () => {
      const r = hero.getBoundingClientRect();
      escena.progreso(-r.top / Math.max(1, r.height * 0.85));
    };
    addEventListener('scroll', alScroll, { passive: true });
    alScroll();

    const alMover = (e: PointerEvent) =>
      escena.puntero((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    if (!compacto) addEventListener('pointermove', alMover, { passive: true });

    this.limpiezas.push(
      () => medir.disconnect(),
      () => visible.disconnect(),
      () => removeEventListener('scroll', alScroll),
      () => removeEventListener('pointermove', alMover),
    );
  }
}

// Gestos del usuario, no eventos que el navegador emite solo (como scroll al restaurar posición).
function alPrimerGesto(f: () => void, limpiezas: (() => void)[]): void {
  const eventos = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
  const una = () => {
    eventos.forEach((e) => removeEventListener(e, una));
    f();
  };
  eventos.forEach((e) => addEventListener(e, una, { passive: true, once: true }));
  limpiezas.push(() => eventos.forEach((e) => removeEventListener(e, una)));
}
