import { Component, ElementRef, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { vi } from 'vitest';
import { MotionEngine, MotionLoader, useMotion } from './motion-runtime';
import { MotionPreferences } from './motion-preferences';

const cleanup = vi.fn();

@Component({ template: '<p>Contenido disponible</p>' })
class MotionProbe {
  constructor() {
    useMotion(inject(ElementRef), (engine, root) => {
      engine.gsap.set(root, { opacity: 0.5 });
      return cleanup;
    });
  }
}

@Component({ template: '<p>Contenido disponible</p>' })
class FailedMotionProbe {
  constructor() {
    useMotion(inject(ElementRef), (engine, root) => {
      engine.gsap.set(root, { opacity: 0 });
      throw new Error('Animation setup failed');
    });
  }
}

describe('Progressive motion lifecycle', () => {
  let resolve: (engine: MotionEngine) => void;
  let reject: (error: Error) => void;
  let load: ReturnType<typeof vi.fn>;
  const preference = { ready: signal(false), reduced: signal(false), unavailable: signal(false) };
  const engine = { gsap } as MotionEngine;

  beforeEach(() => {
    cleanup.mockClear();
    preference.ready.set(false);
    preference.reduced.set(false);
    preference.unavailable.set(false);
    load = vi.fn(
      () =>
        new Promise<MotionEngine>((accept, fail) => {
          resolve = accept;
          reject = fail;
        }),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: MotionPreferences, useValue: preference },
        { provide: MotionLoader, useValue: { load } },
      ],
    });
  });

  it('keeps content readable and does not load GSAP before browser readiness or with reduced motion', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Contenido disponible');
    preference.reduced.set(true);
    preference.ready.set(true);
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.style.opacity).toBe('');
  });

  it('reverts GSAP styles and releases component resources when motion is reduced', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    resolve(engine);
    await fixture.whenStable();
    expect(fixture.nativeElement.style.opacity).toBe('0.5');
    preference.reduced.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.style.opacity).toBe('');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reverts styles and releases resources when the component is destroyed', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    resolve(engine);
    await fixture.whenStable();
    fixture.destroy();
    expect(fixture.nativeElement.style.opacity).toBe('');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('ignores an import that resolves after the component was destroyed', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    fixture.destroy();
    resolve(engine);
    await Promise.resolve();
    expect(fixture.nativeElement.style.opacity).toBe('');
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('ignores an import that resolves after movement was disabled', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    preference.reduced.set(true);
    await fixture.whenStable();
    resolve(engine);
    await fixture.whenStable();
    expect(fixture.nativeElement.style.opacity).toBe('');
  });

  it('falls back to readable content when the animation chunk fails to load', async () => {
    const fixture = TestBed.createComponent(MotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    reject(new Error('Offline'));
    await vi.waitFor(() => expect(preference.unavailable()).toBe(true));
    expect(fixture.nativeElement.style.opacity).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Contenido disponible');
  });

  it('restores styles if setup fails after changing the DOM', async () => {
    const fixture = TestBed.createComponent(FailedMotionProbe);
    preference.ready.set(true);
    await fixture.whenStable();
    resolve(engine);
    await vi.waitFor(() => expect(preference.unavailable()).toBe(true));
    expect(fixture.nativeElement.style.opacity).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Contenido disponible');
  });
});
