import {
  afterNextRender,
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MotionPreferences {
  readonly ready = signal(false);
  readonly systemReduced = signal(false);
  readonly manualReduced = signal(false);
  readonly unavailable = signal(false);
  readonly reduced = computed(
    () => this.systemReduced() || this.manualReduced() || this.unavailable(),
  );
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (typeof window.matchMedia !== 'function') return;
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => this.systemReduced.set(query.matches);
      update();
      query.addEventListener('change', update);
      this.ready.set(true);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', update));
    });

    effect((onCleanup) => {
      if (!this.ready()) return;
      const root = document.documentElement;
      const previous = root.getAttribute('data-motion');
      root.setAttribute('data-motion', this.reduced() ? 'reduced' : 'active');
      onCleanup(() =>
        previous === null
          ? root.removeAttribute('data-motion')
          : root.setAttribute('data-motion', previous),
      );
    });
  }

  toggle(): void {
    if (!this.systemReduced() && !this.unavailable()) this.manualReduced.update((value) => !value);
  }
}
