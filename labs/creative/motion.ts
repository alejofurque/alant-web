import { gsap } from 'gsap';
export type Concept = 'fragmented' | 'blueprint' | 'depth';

// Pure timeline construction: the host owns context cleanup, pause and reduced motion.
export function buildConcept(concept: Concept, root: HTMLElement): gsap.core.Timeline {
  const scene = root.querySelector<HTMLElement>(`.${concept}`)!;
  const q = (selector: string) => scene.querySelectorAll(selector);
  const width = root.querySelector<HTMLElement>('.stage')!.clientWidth;
  const mobile = width < 750;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
  if (concept === 'fragmented') {
    tl.fromTo(
      q('.piece'),
      {
        x: (i) => [-0.04, 0.025, -0.055][i] * width,
        y: (i) => (mobile ? [-8, 15, 16][i] : [-20, -40, 40][i]),
        rotation: (i) => [-10, 8, -6][i],
        scale: mobile ? 0.95 : 1.08,
      },
      { x: 0, y: 0, rotation: 0, scale: 1, duration: 2.4, stagger: 0.2 },
      1.1,
    )
      .fromTo(
        q('.workspace'),
        { scaleX: 0.1, scaleY: 0.7, opacity: 0 },
        { scaleX: 1, scaleY: 1, opacity: 1, duration: 1.8 },
        2.3,
      )
      .to(q('.fragment-caption'), { y: -30, opacity: 0, duration: 0.5 }, 1)
      .fromTo(
        q('.bridges path'),
        { strokeDashoffset: 1, opacity: 1 },
        { strokeDashoffset: 0, duration: 1.3, stagger: 0.25 },
        2,
      )
      .to(q('.bridges'), { opacity: 0, duration: 0.5 }, 4.1)
      .to(q('.loose-tag,.message'), { opacity: 0, y: -12, duration: 0.5 }, 3.8)
      .fromTo(
        q('.shared-tag,.team-result'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        4.5,
      )
      .fromTo(
        q('.fragment-finish'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        5.2,
      )
      .to(q('.workspace-top b'), { opacity: 0, duration: 0.2 }, 5.1);
  } else if (concept === 'blueprint') {
    tl.fromTo(
      q('.blue-lines path'),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.8, stagger: 0.2 },
      0.2,
    )
      .to(
        q('.schema'),
        {
          x: (i) => (1 - i) * width * (mobile ? 0 : 0.29),
          y: (i) => (mobile ? (1 - i) * 110 : 0),
          scale: 0.72,
          duration: 1.7,
          stagger: 0.1,
        },
        1.5,
      )
      .to(q('.schema'), { opacity: 0, scale: 0.5, duration: 0.6 }, 3)
      .to(q('.blue-label,.blue-lines'), { opacity: 0, duration: 0.7 }, 2.8)
      .to(q('.blue-grid'), { opacity: 0.2, duration: 1.4 }, 3.1)
      .fromTo(
        q('.product'),
        {
          rotationY: -28,
          rotationX: 12,
          scale: 0.75,
          y: 50,
          opacity: 0,
          transformPerspective: 1200,
        },
        { rotationY: 0, rotationX: 0, scale: 1, y: 0, opacity: 1, duration: 1.6 },
        3.1,
      )
      .fromTo(q('.product aside'), { xPercent: -105 }, { xPercent: 0, duration: 0.8 }, 3.7)
      .fromTo(
        q('.product-row'),
        { x: 55, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, stagger: 0.15 },
        4,
      )
      .fromTo(
        q('.product-bottom,.blue-finish'),
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
        5.2,
      );
  } else {
    tl.fromTo(
      q('.depth-world'),
      {
        rotationX: mobile ? 42 : 52,
        rotationZ: mobile ? -10 : -24,
        scale: mobile ? 0.7 : 0.45,
        x: mobile ? 0 : width * 0.08,
        y: mobile ? 12 : -20,
      },
      {
        rotationX: mobile ? 25 : 40,
        rotationZ: mobile ? 0 : -12,
        scale: mobile ? 0.75 : 0.55,
        x: mobile ? 0 : width * 0.06,
        y: mobile ? 0 : -20,
        duration: 2,
      },
      1.5,
    )
      .fromTo(
        q('.data-plane'),
        { z: -70, y: mobile ? 70 : 50 },
        { z: -50, y: 50, duration: 2 },
        1.5,
      )
      .fromTo(q('.rules-plane'), { z: 30, y: -18 }, { z: 30, y: 0, duration: 2 }, 1.5)
      .fromTo(
        q('.interface-plane'),
        { z: mobile ? 110 : 100, y: mobile ? -70 : -60 },
        { z: 80, y: -45, duration: 2 },
        1.5,
      )
      .fromTo(q('.data-path'), { scaleX: 0.08 }, { scaleX: 1, duration: 1.2 }, 1.7)
      .fromTo(
        q('.rule-flow b'),
        { backgroundColor: '#214e3b' },
        { backgroundColor: '#47795a', duration: 0.6, repeat: 1, yoyo: true },
        2.6,
      )
      .to(q('.plane'), { z: (i) => i * 8, y: 0, duration: 1.6, stagger: 0.14 }, 3.5)
      .to(
        q('.depth-world'),
        { rotationX: 0, rotationZ: 0, scale: 1, x: 0, y: 15, duration: 1.8 },
        3.5,
      )
      .to(q('.depth-heading'), { y: -10, duration: 1 }, 3.5)
      .fromTo(
        q('.task-list span'),
        { opacity: 0.35, x: 18 },
        { opacity: 1, x: 0, stagger: 0.15, duration: 0.6 },
        4.7,
      );
  }
  // A short hold at each end makes the complete story visible without scrolling.
  tl.to({}, { duration: 0.7 }, 6.1);
  return tl;
}
