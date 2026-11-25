import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { provideRouter } from '@angular/router';

describe('Homepage navigation and contact', () => {
  it('answers what, for whom and how to contact, with working links', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(page.querySelector('h1')?.textContent).toMatch(/Software hecho\s+a medida/);
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="/#"]')) {
      expect(page.querySelector(new URL(link.href).hash)).not.toBeNull();
    }
    expect(
      [...page.querySelectorAll('.service-more')].map((link) => link.getAttribute('href')),
    ).toEqual(['/servicios#web', '/servicios#software', '/servicios#automatizacion']);
    expect(page.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(page.querySelector('.hero .cta')?.getAttribute('href')).toBe('/contacto');
    expect(page.querySelector('.closing a')?.getAttribute('href')).toBe('/contacto');

    // Every visitor finds their need in the first viewport and its own service section.
    const needs = [...page.querySelectorAll<HTMLAnchorElement>('.needs a')];
    expect(needs.map((a) => a.getAttribute('href'))).toEqual([
      '/#web',
      '/#sistemas',
      '/#automatizacion',
    ]);
    expect(page.querySelectorAll('.service').length).toBe(3);
    const contactTypes = [...page.querySelectorAll('.service-link')].map((a) =>
      a.getAttribute('href'),
    );
    expect(contactTypes).toEqual([
      '/contacto?tipo=web',
      '/contacto?tipo=software',
      '/contacto?tipo=automatizacion',
    ]);

    // Conceptual planes are decorative and never imply working controls.
    expect(page.querySelectorAll('.space app-plane').length).toBe(3);
    for (const plane of page.querySelectorAll('app-plane')) {
      expect(plane.getAttribute('aria-hidden')).toBe('true');
      expect(plane.querySelector('a, button, input')).toBeNull();
    }
    expect(page.querySelector('.stage-note')?.textContent).toContain('Interfaces conceptuales');

    for (const id of ['inicio', 'servicios', 'soluciones', 'proceso', 'contacto'])
      expect(page.querySelector(`#${id}`)).not.toBeNull();
    expect(page.querySelector('app-projects, #proyectos, app-project-card')).toBeNull();
  });
});
