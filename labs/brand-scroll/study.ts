import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal,
} from '@angular/core';
@Component({ selector: 'brand-study', templateUrl: './study.html' })
export class BrandStudy {
  readonly motionAvailable = signal(false);
  readonly reduced = signal(false);
  private disposeMotion?: () => void;
  private userReduced = false;
  private system?: MediaQueryList;
  private generation = 0;
  private readonly root = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  constructor() {
    afterNextRender(() => {
      this.system = matchMedia('(prefers-reduced-motion: reduce)');
      const change = () => void this.update();
      this.system.addEventListener('change', change);
      void this.update();
      this.destroy.onDestroy(() => {
        this.generation++;
        this.disposeMotion?.();
        this.system?.removeEventListener('change', change);
      });
    });
  }
  toggle(): void {
    this.userReduced = !this.userReduced;
    void this.update();
  }
  private async update(): Promise<void> {
    const generation = ++this.generation;
    this.disposeMotion?.();
    this.disposeMotion = undefined;
    this.reduced.set(this.userReduced || !!this.system?.matches);
    this.motionAvailable.set(!this.system?.matches);
    if (this.reduced()) return;
    try {
      const { mountSculpture } = await import('./study-motion');
      if (this.destroy.destroyed || generation !== this.generation) return;
      this.zone.runOutsideAngular(
        () => (this.disposeMotion = mountSculpture(this.root.nativeElement)),
      );
    } catch {
      this.motionAvailable.set(false);
      this.reduced.set(true);
    }
  }
}
