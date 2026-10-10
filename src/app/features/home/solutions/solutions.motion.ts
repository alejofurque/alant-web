import { MotionEngine } from '../../../core/motion/motion-runtime';
import { connectionPaths, SYSTEM_LAYOUTS, SystemState } from './story-visual/system-layout';

function systemParts(visual: Element) {
  const canvas = visual.querySelector<HTMLElement>('.scene-canvas')!;
  return {
    canvas,
    modules: [...visual.querySelectorAll<HTMLElement>('.module-motion')],
    core: visual.querySelector('[data-module="core"]')!,
    paths: [...visual.querySelectorAll<SVGPathElement>('[data-edge]')],
    bases: visual.querySelectorAll('.line-base'),
    draws: visual.querySelectorAll('.line-draw'),
    signals: [...visual.querySelectorAll('.line-signal')],
    activation: visual.querySelector('.node-core .node-activation')!,
    shell: visual.querySelector('.platform-shell')!,
    outline: visual.querySelector('.platform-outline')!,
    depth: visual.querySelectorAll('.module-depth'),
    labels: [...visual.querySelectorAll('.phase-label')],
    placeholder: visual.querySelector('.result-placeholder')!,
    result: visual.querySelector('.result-complete')!,
  };
}

type SystemParts = ReturnType<typeof systemParts>;

function pose(parts: SystemParts, baseline: SystemState, target: SystemState) {
  return {
    x: (index: number) =>
      ((SYSTEM_LAYOUTS[target][index].x - SYSTEM_LAYOUTS[baseline][index].x) *
        parts.canvas.clientWidth) /
      100,
    y: (index: number) =>
      ((SYSTEM_LAYOUTS[target][index].y - SYSTEM_LAYOUTS[baseline][index].y) *
        parts.canvas.clientHeight) /
      100,
    rotation: (index: number) => SYSTEM_LAYOUTS[target][index].rotation,
  };
}

function pathShape(state: SystemState) {
  const paths = connectionPaths(state);
  return { d: (_index: number, path: SVGPathElement) => paths[Number(path.dataset['edge'])] };
}

function flow(timeline: gsap.core.Timeline, parts: SystemParts, at: number, duration: number) {
  const inputs = parts.signals.slice(0, 3);
  timeline
    .fromTo(
      inputs,
      { opacity: 1, strokeDashoffset: 0.1 },
      { strokeDashoffset: -1.1, duration, stagger: 0.07, ease: 'none', immediateRender: false },
      at,
    )
    .fromTo(
      parts.activation,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1.13, duration: 0.17, immediateRender: false },
      at + duration * 0.8,
    )
    .to(parts.activation, { opacity: 0, scale: 1.3, duration: 0.25 }, at + duration * 0.8 + 0.17)
    .fromTo(
      parts.signals[3],
      { opacity: 1, strokeDashoffset: 0.1 },
      { strokeDashoffset: -1.1, duration: duration * 0.75, ease: 'none', immediateRender: false },
      at + duration + 0.08,
    )
    .set(parts.signals, { opacity: 0 }, at + duration * 1.75 + 0.1);
}

function integrate(
  timeline: gsap.core.Timeline,
  parts: SystemParts,
  baseline: SystemState,
  at: number,
) {
  timeline
    .fromTo(
      parts.modules,
      pose(parts, baseline, 0),
      { ...pose(parts, baseline, 1), duration: 0.82, ease: 'power2.inOut' },
      at,
    )
    .fromTo(
      parts.core,
      { scale: 0.25, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.52, ease: 'power3.out' },
      at + 0.33,
    )
    .fromTo(parts.bases, { opacity: 0 }, { opacity: 0.24, duration: 0.35 }, at + 0.58)
    .fromTo(
      parts.draws,
      { strokeDashoffset: 1, opacity: 1 },
      { strokeDashoffset: 0, duration: 0.58, stagger: 0.065, ease: 'power1.inOut' },
      at + 0.52,
    )
    .to(parts.labels[0], { opacity: 0, duration: 0.12 }, at + 0.52)
    .to(parts.labels[1], { opacity: 1, duration: 0.12 }, at + 0.52);
  flow(timeline, parts, at + 0.92, 0.46);
}

function unify(
  timeline: gsap.core.Timeline,
  parts: SystemParts,
  baseline: SystemState,
  at: number,
) {
  timeline
    .to(parts.modules, { ...pose(parts, baseline, 2), duration: 0.8, ease: 'power2.inOut' }, at)
    .to(parts.paths, { attr: pathShape(2), duration: 0.8, ease: 'power2.inOut' }, at)
    .fromTo(
      parts.depth,
      { x: 7, y: 8, opacity: 1 },
      { x: 0, y: 0, opacity: 0, duration: 0.65 },
      at + 0.1,
    )
    .fromTo(
      parts.shell,
      { scale: 0.78, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out' },
      at + 0.1,
    )
    .fromTo(
      parts.outline,
      { strokeDashoffset: 1, opacity: 0.8 },
      { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' },
      at + 0.12,
    )
    .to(parts.labels[1], { opacity: 0, duration: 0.12 }, at + 0.32)
    .to(parts.labels[2], { opacity: 1, duration: 0.12 }, at + 0.32)
    .to(parts.placeholder, { opacity: 0, duration: 0.2 }, at + 1.03)
    .fromTo(
      parts.result,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.36, ease: 'power2.out' },
      at + 1.08,
    );
  flow(timeline, parts, at + 0.8, 0.3);
}

function prepare(gsap: MotionEngine['gsap'], parts: SystemParts, initial: 0 | 1) {
  gsap.set(parts.paths, { attr: pathShape(1) });
  gsap.set(parts.signals, { opacity: 0 });
  gsap.set(parts.labels, { opacity: 0 });
  gsap.set(parts.labels[initial], { opacity: 1 });
  gsap.set(parts.placeholder, { opacity: 1 });
  gsap.set(parts.result, { opacity: 0 });
  gsap.set([parts.shell, parts.outline], { opacity: 0 });
}

export function buildSystemTransformation(
  gsap: MotionEngine['gsap'],
  visual: Element,
  timeline: gsap.core.Timeline,
): void {
  const parts = systemParts(visual);
  prepare(gsap, parts, 0);
  integrate(timeline, parts, 2, 1);
  unify(timeline, parts, 2, 2.8);
}

export function createStoryMotion(
  { gsap, ScrollTrigger }: MotionEngine,
  root: HTMLElement,
  setActive: (index: number | null) => void,
): () => void {
  const media = gsap.matchMedia();
  const track = root.querySelector<HTMLElement>('.story-track')!;
  const steps = [...root.querySelectorAll<HTMLElement>('.story-step')];
  let previous = -1;
  const select = (index: number) => {
    if (previous === index) return;
    previous = index;
    setActive(index);
    track.setAttribute('data-active-stage', String(index + 1));
  };

  const restore = () => {
    track.classList.remove('story-enhanced');
    track.removeAttribute('data-active-stage');
    setActive(null);
  };
  try {
    media.add(
      {
        desktop: '(min-width: 1001px) and (min-height: 800px)',
        compact: '(max-width: 1000px), (max-height: 799px)',
      },
      (context) => {
        previous = -1;
        if (context.conditions!['desktop']) {
          track.classList.add('story-enhanced');
          const timeline = gsap.timeline({
            scrollTrigger: {
              id: 'alant-system-transformation',
              trigger: track,
              start: 'top 55%',
              end: 'bottom bottom+=48',
              scrub: 0.55,
              invalidateOnRefresh: true,
              onUpdate: (trigger) => select(Math.min(2, Math.floor(trigger.progress * 3))),
              onRefresh: (trigger) => select(Math.min(2, Math.floor(trigger.progress * 3))),
            },
          });
          buildSystemTransformation(gsap, root.querySelector('.living-system')!, timeline);
          timeline.to(
            root.querySelector('.story-progress'),
            { scaleX: 1, duration: 4.4, ease: 'none' },
            0,
          );
        } else {
          steps.forEach((step, index) => {
            const visual = step.querySelector('.inline-visual')!;
            const parts = systemParts(visual);
            const timeline = gsap.timeline({
              scrollTrigger: {
                id: `alant-system-stage-${index + 1}`,
                trigger: visual,
                start: 'top 90%',
                end: 'center 45%',
                scrub: 0.35,
                invalidateOnRefresh: true,
              },
            });
            if (index === 0) {
              timeline.fromTo(
                parts.modules.slice(0, 4),
                {
                  x: (node: number) => (node % 2 ? -24 : 24),
                  y: 28,
                  rotation: (node: number) => SYSTEM_LAYOUTS[0][node].rotation * 1.7,
                },
                {
                  x: 0,
                  y: 0,
                  rotation: (node: number) => SYSTEM_LAYOUTS[0][node].rotation,
                  duration: 1,
                  stagger: 0.08,
                  ease: 'power2.out',
                },
              );
            } else {
              prepare(gsap, parts, index === 1 ? 0 : 1);
              if (index === 1) {
                integrate(timeline, parts, 1, 0.08);
              } else {
                // Explicit initial pose stays part of the timeline, so refresh recalculates pixel offsets.
                timeline.fromTo(
                  parts.modules,
                  pose(parts, 2, 1),
                  { ...pose(parts, 2, 1), duration: 0.01 },
                  0,
                );
                gsap.set(parts.draws, { opacity: 0.6, strokeDashoffset: 0 });
                unify(timeline, parts, 2, 0.12);
              }
            }
            ScrollTrigger.create({
              trigger: step,
              start: 'top center',
              end: 'bottom center',
              onToggle: (trigger) => {
                if (trigger.isActive) select(index);
              },
              onRefresh: (trigger) => {
                if (trigger.isActive) select(index);
              },
            });
          });
        }
        return restore;
      },
      root,
    );
  } catch (error) {
    media.revert();
    restore();
    throw error;
  }
  return () => {
    media.revert();
    restore();
  };
}
