import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Normal document scroll drives the sculpture in both directions. No pin, loop or timers. */
export function mountSculpture(root: HTMLElement): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => {
    const media = gsap.matchMedia();
    media.add({ compact: '(max-width: 850px)', desktop: '(min-width: 851px)' }, (state) => {
      const compact = !!state.conditions?.['compact'];
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.sculpture',
          start: compact ? 'top 75%' : 'top 22%',
          end: compact ? 'top 15%' : 'top -8%',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });
      // The CSS pose is the complete no-JS/reduced-motion composition.
      timeline
        .fromTo(
          '.assembly',
          { rotationX: 48, rotationY: -12, rotationZ: -32, y: 0, scale: compact ? 0.85 : 1 },
          {
            scale: compact ? 0.74 : 0.84,
            rotationX: 16,
            rotationY: 24,
            rotationZ: -8,
            y: compact ? 18 : 50,
            duration: 0.55,
          },
          0,
        )
        .fromTo(
          '.plate-paper',
          { z: compact ? 45 : 65, x: compact ? -28 : -42, y: compact ? -30 : -45 },
          {
            z: compact ? 90 : 180,
            x: compact ? -65 : -110,
            y: compact ? -55 : -95,
            rotationZ: -15,
            duration: 0.55,
          },
          0,
        )
        .fromTo(
          '.plate-frame',
          { z: 0, x: 0, y: 0 },
          { z: 35, x: 25, y: 0, rotationZ: 6, duration: 0.55 },
          0,
        )
        .fromTo(
          '.plate-mint',
          { z: compact ? -45 : -65, x: compact ? 28 : 42, y: compact ? 30 : 45 },
          {
            z: compact ? -65 : -105,
            x: compact ? 65 : 120,
            y: compact ? 45 : 80,
            rotationZ: 18,
            duration: 0.55,
          },
          0,
        )
        .to(
          '.assembly',
          {
            scale: compact ? 0.85 : 0.94,
            rotationX: 49,
            rotationY: -10,
            rotationZ: 14,
            y: compact ? -15 : 5,
            duration: 0.45,
          },
          0.55,
        )
        .to(
          '.plate-paper',
          {
            x: compact ? -45 : -90,
            y: compact ? 32 : 55,
            z: compact ? 75 : 115,
            rotationZ: 0,
            duration: 0.45,
          },
          0.55,
        )
        .to('.plate-frame', { x: 0, y: 0, z: 0, rotationZ: 0, duration: 0.45 }, 0.55)
        .to(
          '.plate-mint',
          {
            x: compact ? 45 : 90,
            y: compact ? -32 : -55,
            z: compact ? -75 : -115,
            rotationZ: 0,
            duration: 0.45,
          },
          0.55,
        )
        .fromTo(
          '.edge-light',
          { scaleX: 0.12, transformOrigin: 'left' },
          { scaleX: 1, duration: 1 },
          0,
        )
        .fromTo(
          '.scene-rule span',
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 1 },
          0,
        );
      return () => timeline.scrollTrigger?.kill();
    });
    return () => media.revert();
  }, root);
  return () => context.revert();
}
