import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MotionPreferences } from './motion-preferences';

@Component({ template: '' })
class PreferencesProbe {
  readonly preference = inject(MotionPreferences);
}

describe('Motion preferences', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('honors operating-system changes, prevents overriding reduction, and removes its listener', async () => {
    let change: () => void = () => {};
    const query = {
      matches: true,
      addEventListener: vi.fn((_event, listener) => {
        change = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => query),
    );
    const fixture = TestBed.createComponent(PreferencesProbe);
    await fixture.whenStable();
    const preference = fixture.componentInstance.preference;
    expect(preference.ready()).toBe(true);
    expect(preference.reduced()).toBe(true);
    expect(document.documentElement.dataset['motion']).toBe('reduced');
    preference.toggle();
    expect(preference.manualReduced()).toBe(false);
    query.matches = false;
    change();
    await fixture.whenStable();
    expect(preference.reduced()).toBe(false);
    preference.toggle();
    await fixture.whenStable();
    expect(preference.reduced()).toBe(true);
    TestBed.resetTestingModule();
    expect(query.removeEventListener).toHaveBeenCalledWith('change', change);
    expect(document.documentElement.hasAttribute('data-motion')).toBe(false);
  });
});
