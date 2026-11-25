import type { MotionEngine } from './motion-runtime';

/** Quiet entrance for every `.reveal` element inside a page, played once. */
export function mountReveals({ gsap, ScrollTrigger }: MotionEngine, root: HTMLElement): void {
  const items = root.querySelectorAll('.reveal');
  if (!items.length) return;
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.07,
          clearProps: 'transform',
        },
      ),
  });
}
