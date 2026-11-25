import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { buildConcept, Concept } from './motion';

@Component({
  selector: 'creative-lab',
  templateUrl: './lab.html',
  styleUrls: ['./lab.css', './scenes.css'],
})
export class CreativeLab {
  readonly concept = signal<Concept>('fragmented');
  readonly progress = signal(0);
  readonly playing = signal(false);
  readonly reduced = signal(false);
  readonly systemReduced = signal(false);
  readonly choices = [
    {
      id: 'fragmented' as const,
      name: 'Fragmented to Unified',
      tag: '01 / INTEGRACIÓN',
      description: $localize`Pedidos, stock y mensajes separados se convierten en un espacio de trabajo compartido.`,
      phases: [
        $localize`Herramientas dispersas`,
        $localize`Un mismo recorrido`,
        $localize`Una operación conectada`,
      ],
    },
    {
      id: 'blueprint' as const,
      name: 'Blueprint to Product',
      tag: '02 / SOFTWARE A MEDIDA',
      description: $localize`De las reglas y la arquitectura a una herramienta que permite revisar y coordinar pedidos.`,
      phases: [
        $localize`Definir la arquitectura`,
        $localize`Construir la interfaz`,
        $localize`Trabajar con claridad`,
      ],
    },
    {
      id: 'depth' as const,
      name: 'Engineered Depth',
      tag: '03 / INGENIERÍA DE SISTEMAS',
      description: $localize`Datos, reglas e interfaz: capas diferentes que funcionan como un único producto.`,
      phases: [
        $localize`Explorar las capas`,
        $localize`Conectar responsabilidades`,
        $localize`Ensamblar el producto`,
      ],
    },
  ];
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private context?: gsap.Context;
  private timeline?: gsap.core.Timeline;
  private media?: MediaQueryList;
  private observer?: ResizeObserver;
  private lastWidth = 0;
  private resizeFrame = 0;
  get current() {
    return this.choices.find((c) => c.id === this.concept())!;
  }
  get phase() {
    return Math.min(2, Math.floor(this.progress() / 34));
  }

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      this.media = matchMedia('(prefers-reduced-motion: reduce)');
      const preference = () => {
        this.systemReduced.set(this.media!.matches);
        this.reduced.set(this.media!.matches);
        this.rebuild();
      };
      this.media.addEventListener('change', preference);
      preference();
      this.observer = new ResizeObserver(([entry]) => {
        if (Math.abs(entry.contentRect.width - this.lastWidth) < 2) return;
        this.lastWidth = entry.contentRect.width;
        cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = requestAnimationFrame(() => this.rebuild());
      });
      this.observer.observe(this.host.nativeElement.querySelector('.stage')!);
      destroy.onDestroy(() => {
        this.media?.removeEventListener('change', preference);
        this.observer?.disconnect();
        cancelAnimationFrame(this.resizeFrame);
        this.context?.revert();
      });
    });
  }
  select(id: Concept) {
    this.concept.set(id);
    this.progress.set(0);
    this.rebuild();
  }
  private rebuild() {
    const progress = this.reduced() ? 1 : this.progress() / 100;
    this.context?.revert();
    this.playing.set(false);
    this.context = gsap.context(() => {
      this.timeline = buildConcept(this.concept(), this.host.nativeElement);
      this.timeline.eventCallback('onUpdate', () =>
        this.progress.set(Math.round(this.timeline!.progress() * 100)),
      );
      this.timeline.eventCallback('onComplete', () => this.playing.set(false));
      this.timeline.progress(progress).pause();
    }, this.host.nativeElement);
  }
  play() {
    if (this.reduced()) return;
    this.playing.set(true);
    this.timeline?.restart();
  }
  pause() {
    this.timeline?.pause();
    this.playing.set(false);
  }
  seek(value: number) {
    this.pause();
    this.timeline?.progress(value / 100);
    this.progress.set(value);
  }
  input(event: Event) {
    this.seek(Number((event.target as HTMLInputElement).value));
  }
  toggleReduction() {
    if (this.systemReduced()) return;
    this.reduced.update((value) => !value);
    this.rebuild();
  }
}
