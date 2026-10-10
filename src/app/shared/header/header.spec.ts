import { TestBed } from '@angular/core/testing';
import { Header } from './header';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
@Component({ template: '' })
class TestPage {}

describe('Mobile navigation', () => {
  it('opens, closes after navigation, and restores focus on Escape', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'servicios', component: TestPage }])],
    });
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const button = page.querySelector<HTMLButtonElement>('.menu-button')!;
    const menu = page.querySelector<HTMLElement>('#mobile-navigation')!;
    expect(page.querySelector('a[href*="proyectos"]')).toBeNull();
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hidden).toBe(false);
    menu.querySelector<HTMLAnchorElement>('a')!.click();
    await fixture.whenStable();
    expect(menu.hidden).toBe(true);
    button.click();
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(menu.hidden).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Abrir menú');
    expect(document.activeElement).toBe(button);
  });
});
