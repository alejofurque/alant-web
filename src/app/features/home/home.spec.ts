import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { provideRouter } from '@angular/router';

describe('Homepage navigation and contact', () => {
  it('renders one main heading and resolves every section link', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('h1').length).toBe(1);
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(page.querySelector(link.getAttribute('href')!)).not.toBeNull();
    }
    expect(page.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(page.querySelector('.contact-action a')?.getAttribute('href')).toBe('/contacto');
    expect(page.querySelector('.hero-actions a')?.getAttribute('href')).toBe('/contacto');
    expect(page.querySelector('app-projects, #proyectos, app-project-card')).toBeNull();
    expect(page.textContent).not.toContain('Portfolio en preparación');
  });
});
