import type { MotionEngine } from '../../../core/motion/motion-runtime';
import { Pose, STAGE_PARTS, STAGE_POSES, StagePart } from './poses';

export const STAGE_QUERY = '(min-width: 1100px)';

/**
 * Desktop: document scroll scrubs the sticky stage from the hero sculpture to
 * one product per service, in both directions. No pinning, no added scroll length.
 * Compact: the hero sculpture opens gently as it leaves the viewport.
 */
export function mountShowcase({ gsap }: MotionEngine, root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('.stage')!;
  const space = root.querySelector<HTMLElement>('.space')!;
  const parts = {} as Record<StagePart, HTMLElement>;
  for (const part of STAGE_PARTS)
    parts[part] = root.querySelector<HTMLElement>(
      part === 'assembly' || part === 'floor' ? `.${part}` : `.space .plane-${part}`,
    )!;
  // Poses are authored in em so they follow the stage's responsive font-size.
  const em = () => parseFloat(getComputedStyle(space).fontSize) || 10;
  const vars = (pose: Pose) => ({
    x: () => (pose.x ?? 0) * em(),
    y: () => (pose.y ?? 0) * em(),
    z: () => (pose.z ?? 0) * em(),
    rotationX: pose.rx ?? 0,
    rotationY: pose.ry ?? 0,
    rotationZ: pose.rz ?? 0,
    scale: pose.s ?? 1,
    opacity: pose.o ?? 1,
    '--shade': pose.d ?? 0,
  });

  const context = gsap.context(() => {
    const media = gsap.matchMedia();

    media.add(STAGE_QUERY, () => {
      stage.classList.add('is-scrubbed');
      for (const part of STAGE_PARTS) gsap.set(parts[part], vars(STAGE_POSES[0][part]));

      root.querySelectorAll<HTMLElement>('.service').forEach((block, index) => {
        const from = STAGE_POSES[index];
        const to = STAGE_POSES[index + 1];
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: block,
            start: 'top 88%',
            end: 'top 30%',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
        for (const part of STAGE_PARTS)
          timeline.fromTo(
            parts[part],
            vars(from[part]),
            { ...vars(to[part]), immediateRender: false },
            0,
          );
      });

      gsap.to(stage, {
        '--progress': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      // A restrained response to the pointer, only for precise pointers and only in the hero.
      const tilt = root.querySelector<HTMLElement>('.tilt')!;
      if (!window.matchMedia('(pointer: fine)').matches)
        return () => stage.classList.remove('is-scrubbed');
      const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 1.2, ease: 'power3.out' });
      const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 1.2, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const bounds = stage.getBoundingClientRect();
        const nx = (event.clientX - bounds.left) / bounds.width - 0.5;
        const ny = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateY(gsap.utils.clamp(-0.6, 0.6, nx) * 7);
        rotateX(gsap.utils.clamp(-0.6, 0.6, ny) * -5);
      };
      const reset = () => {
        rotateX(0);
        rotateY(0);
      };
      stage.addEventListener('pointermove', move);
      stage.addEventListener('pointerleave', reset);
      return () => {
        stage.removeEventListener('pointermove', move);
        stage.removeEventListener('pointerleave', reset);
        stage.classList.remove('is-scrubbed');
      };
    });

    media.add(`not all and ${STAGE_QUERY}`, () => {
      // Explicit start values: GSAP must not decompose the CSS 3D matrix.
      for (const part of STAGE_PARTS) gsap.set(parts[part], vars(STAGE_POSES[0][part]));
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top 70%',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .fromTo(parts.assembly, { rotationZ: -36 }, { rotationZ: -24 }, 0)
        .fromTo(parts.web, { z: () => 16 * em() }, { z: () => 26 * em() }, 0)
        .fromTo(parts.system, { z: () => 8 * em() }, { z: () => 13 * em() }, 0);
    });

    return () => media.revert();
  }, root);
  return () => context.revert();
}
