import { DestroyRef, effect, ElementRef, inject, Injectable, NgZone } from '@angular/core';
import { MotionPreferences } from './motion-preferences';

export interface MotionEngine {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
}

@Injectable({ providedIn: 'root' })
export class MotionLoader {
  private pending?: Promise<MotionEngine>;

  load(): Promise<MotionEngine> {
    return (this.pending ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([core, plugin]) => {
        core.gsap.registerPlugin(plugin.ScrollTrigger);
        return { gsap: core.gsap, ScrollTrigger: plugin.ScrollTrigger };
      },
    ));
  }
}

type MotionSetup = (
  engine: MotionEngine,
  root: HTMLElement,
  context: gsap.Context,
) => void | (() => void);

// Called in a component injection context. Server rendering never loads the animation engine.
export function useMotion(element: ElementRef<HTMLElement>, setup: MotionSetup): void {
  const preference = inject(MotionPreferences);
  const loader = inject(MotionLoader);
  const destroyRef = inject(DestroyRef);
  const zone = inject(NgZone);

  effect((onCleanup) => {
    if (!preference.ready() || preference.reduced()) return;
    let canceled = false;
    let context: gsap.Context | undefined;

    zone.runOutsideAngular(() => {
      void loader
        .load()
        .then((engine) => {
          if (canceled || destroyRef.destroyed) return;
          context = engine.gsap.context(() => {}, element.nativeElement);
          try {
            context.add(() => setup(engine, element.nativeElement, context!));
          } catch {
            context.revert();
            preference.unavailable.set(true);
          }
        })
        .catch(() => {
          if (!canceled && !destroyRef.destroyed) preference.unavailable.set(true);
        });
    });

    onCleanup(() => {
      canceled = true;
      context?.revert();
    });
  });
}

export function onceInView(
  element: Element,
  context: gsap.Context,
  play: () => void,
  threshold = 0.35,
): () => void {
  const start = () => {
    try {
      context.add(play);
    } catch {
      // A failed deferred animation must release its styles and restore the static content.
      context.revert();
    }
  };
  if (typeof IntersectionObserver === 'undefined') {
    start();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= threshold))
        return;
      observer.disconnect();
      start();
    },
    { threshold },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
