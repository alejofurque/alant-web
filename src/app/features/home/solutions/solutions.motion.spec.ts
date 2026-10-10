import { gsap } from 'gsap';
import { buildSystemTransformation } from './solutions.motion';

describe('Continuous system transformation', () => {
  it('positions every module before scrolling, moves the same nodes through A/B/C, and reverses', () => {
    const visual = document.createElement('div');
    visual.innerHTML = `<div class="scene-canvas"></div>
      ${['ecommerce', 'erp', 'crm', 'operation', 'core'].map((id) => `<div class="module-motion" data-module="${id}"><i class="module-depth"></i><div class="${id === 'core' ? 'node-core' : 'story-node'}"><i class="node-activation"></i></div></div>`).join('')}
      <svg>${[0, 1, 2, 3].map((edge) => ['line-base', 'line-draw', 'line-signal'].map((name) => `<path class="${name}" data-edge="${edge}"/>`).join('')).join('')}<rect class="platform-outline"/></svg>
      <div class="platform-shell"></div><span class="phase-label"></span><span class="phase-label"></span><span class="phase-label"></span>
      <span class="result-placeholder"></span><span class="result-complete"></span>`;
    document.body.append(visual);
    const canvas = visual.querySelector('.scene-canvas')!;
    Object.defineProperties(canvas, { clientWidth: { value: 600 }, clientHeight: { value: 480 } });
    const nodes = [...visual.querySelectorAll<HTMLElement>('[data-module]')];
    const positions = () => nodes.map((node) => Number(gsap.getProperty(node, 'x')));
    const context = gsap.context(() => {});
    try {
      const timeline = gsap.timeline({ paused: true });
      context.add(() => buildSystemTransformation(gsap, visual, timeline));
      timeline.seek(0.2);
      expect(positions()).toEqual([264, -300, 300, -282, 12]);
      timeline.seek(2.1);
      expect(positions()).toEqual([-42, -330, -42, 60, 18]);
      timeline.progress(1);
      expect(positions()).toEqual([0, 0, 0, 0, 0]);
      expect(Number(gsap.getProperty(visual.querySelector('.result-complete'), 'opacity'))).toBe(1);
      timeline.seek(0.2);
      expect(positions()).toEqual([264, -300, 300, -282, 12]);
      expect([...visual.querySelectorAll('[data-module]')]).toEqual(nodes);
      timeline.kill();
    } finally {
      context.revert();
      visual.remove();
    }
  });
});
