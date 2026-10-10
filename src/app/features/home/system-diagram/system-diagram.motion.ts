import { MotionEngine, onceInView } from '../../../core/motion/motion-runtime';

export function createLivingArchitecture(
  { gsap }: MotionEngine,
  root: HTMLElement,
  context: gsap.Context,
  setReplay: (restart: (() => void) | null) => void,
): () => void {
  const canvas = root.querySelector<HTMLElement>('.diagram-canvas')!;
  const frame = root.querySelector<HTMLElement>('.system-frame')!;
  const svg = root.querySelector<SVGSVGElement>('.connections')!;
  const paths = [...svg.querySelectorAll<SVGPathElement>('path')];
  const originalViewBox = svg.getAttribute('viewBox')!;
  const originalPaths = paths.map((path) => path.getAttribute('d')!);
  const bounds = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();

  // Read stationary slots, not the transforming cards. Connections stay attached after resizing.
  const wire = () => {
    const area = canvas.getBoundingClientRect();
    const core = bounds('.core-slot');
    const vertical = getComputedStyle(canvas).display === 'grid';
    const connect = (from: DOMRect, to: DOMRect) => {
      if (vertical) {
        const x1 = from.left + from.width / 2 - area.left;
        const x2 = to.left + to.width / 2 - area.left;
        const y1 = from.bottom - area.top,
          y2 = to.top - area.top;
        return `M${x1} ${y1}V${(y1 + y2) / 2}H${x2}V${y2}`;
      }
      const x1 = from.right - area.left,
        x2 = to.left - area.left;
      const y1 = from.top + from.height / 2 - area.top;
      const y2 = to.top + to.height / 2 - area.top;
      return `M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;
    };
    const routes: Record<string, string> = {
      crm: connect(bounds('.source-crm'), core),
      erp: connect(bounds('.source-erp'), core),
      output: connect(core, bounds('.output-slot')),
    };
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    paths.forEach((path) => path.setAttribute('d', routes[path.dataset['connection']!]));
    frame.setAttribute('data-wired', '');
  };
  wire();
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(wire);
  resize?.observe(canvas);

  const stopObserving = onceInView(
    frame,
    context,
    () => {
      const sources = root.querySelectorAll('.node-source');
      const core = root.querySelector('.node-core')!;
      const output = root.querySelector('.node-output')!;
      const inputs = root.querySelectorAll('.connection-draw:not([data-connection="output"])');
      const pulses = root.querySelectorAll('.connection-pulse:not([data-connection="output"])');
      const activation = root.querySelector('.core-activation')!;
      const intro = gsap.timeline({
        delay: window.matchMedia('(min-width: 901px)').matches ? 0.35 : 0,
        defaults: { ease: 'power2.inOut' },
        onStart: () => {
          frame.setAttribute('data-boot', 'running');
          frame.setAttribute('data-flow', 'assembling');
        },
        onComplete: () => {
          frame.setAttribute('data-boot', 'complete');
          frame.setAttribute('data-flow', 'complete');
        },
      });
      intro
        .fromTo(
          sources,
          {
            x: -56,
            y: (index: number) => (index ? 24 : -24),
            scale: 0.76,
            rotation: (index: number) => (index ? -6 : 6),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.18,
            ease: 'power3.out',
          },
          0,
        )
        .fromTo(
          core,
          { scale: 0.4, y: 26, rotation: -12, opacity: 0 },
          { scale: 1, y: 0, rotation: 0, opacity: 1, duration: 0.85, ease: 'power3.out' },
          0.7,
        )
        .fromTo(
          output,
          { x: 45, y: 12, scale: 0.82, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.65 },
          3.25,
        )
        .fromTo(
          root.querySelectorAll('.connection-base'),
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          1.15,
        )
        .fromTo(
          inputs,
          { opacity: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.9, stagger: 0.16 },
          1.1,
        )
        .fromTo(
          pulses,
          { opacity: 1, strokeDashoffset: 0.12 },
          {
            strokeDashoffset: -1.12,
            duration: 0.85,
            stagger: 0.22,
            ease: 'none',
            immediateRender: false,
          },
          1.9,
        )
        .fromTo(
          activation,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1.12, duration: 0.3 },
          2.65,
        )
        .to(activation, { opacity: 0, scale: 1.28, duration: 0.5 }, 2.95)
        .to(core, { scale: 1.055, backgroundColor: '#2c5b41', duration: 0.23 }, 2.65)
        .to(core, { scale: 1, backgroundColor: '#203c30', duration: 0.5 }, 2.88)
        .fromTo(
          root.querySelector('.connection-draw[data-connection="output"]'),
          { opacity: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7 },
          3.1,
        )
        .fromTo(
          root.querySelector('.connection-pulse[data-connection="output"]'),
          { opacity: 1, strokeDashoffset: 0.12 },
          { strokeDashoffset: -1.12, duration: 0.72, ease: 'none', immediateRender: false },
          3.6,
        )
        .fromTo(
          root.querySelector('.output-waiting'),
          { opacity: 1 },
          { opacity: 0, duration: 0.2 },
          4.3,
        )
        .fromTo(
          root.querySelector('.output-ready'),
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          4.4,
        )
        .to(root.querySelector('.output-arrow'), { opacity: 0, duration: 0.2 }, 4.3)
        .fromTo(
          root.querySelector('.output-check'),
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.38, ease: 'power3.out' },
          4.4,
        )
        .to(output, { borderColor: '#97e5b3', backgroundColor: '#284434', duration: 0.4 }, 4.35)
        .to(root.querySelectorAll('.connection-draw'), { opacity: 0.42, duration: 0.5 }, 4.5)
        .set(root.querySelectorAll('.connection-pulse'), { opacity: 0 }, 4.5);
      intro.call(() => frame.setAttribute('data-flow', 'routing'), [], 1.1);
      intro.call(() => frame.setAttribute('data-flow', 'validating'), [], 2.65);
      intro.call(() => frame.setAttribute('data-flow', 'delivering'), [], 3.25);
      setReplay(() => {
        intro.restart();
      });
    },
    0.2,
  );

  return () => {
    setReplay(null);
    stopObserving();
    resize?.disconnect();
    svg.setAttribute('viewBox', originalViewBox);
    paths.forEach((path, index) => path.setAttribute('d', originalPaths[index]));
    frame.removeAttribute('data-wired');
    frame.removeAttribute('data-boot');
    frame.removeAttribute('data-flow');
  };
}
