import { TestBed } from '@angular/core/testing';
import { MotionLoader } from '../../../core/motion/motion-runtime';
import { Solutions } from './solutions';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('Solution storytelling fallback', () => {
  it('renders all three business explanations and accessible diagrams before motion loads', async () => {
    const load = vi.fn();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MotionLoader, useValue: { load } }],
    });
    const fixture = TestBed.createComponent(Solutions);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const articles = [...page.querySelectorAll<HTMLElement>('.story-step')];
    expect(articles.map((article) => article.id)).toEqual([
      'solucion-conectar',
      'solucion-construir',
      'solucion-automatizar',
    ]);
    expect(load).not.toHaveBeenCalled();
    expect(page.querySelector('.story-enhanced')).toBeNull();
    for (const article of articles) {
      expect(article.hidden).toBe(false);
      expect(article.querySelector('h3')?.id).toBe(article.getAttribute('aria-labelledby'));
      expect(article.querySelector('figcaption .sr-only')?.textContent?.length).toBeGreaterThan(50);
      expect(article.querySelector('.scenario-cta')?.getAttribute('href')).toBe('/contacto');
    }
    expect(page.querySelector('.story-sticky-track')?.getAttribute('aria-hidden')).toBe('true');
    const links = [...page.querySelectorAll<HTMLAnchorElement>('.story-navigation a')];
    expect(links.map((link) => link.hash)).toEqual(articles.map((article) => '#' + article.id));
    links[2].click();
    await fixture.whenStable();
    expect(links[2].getAttribute('aria-current')).toBe('step');
    expect(articles[0].textContent).toContain('La venta llega por la tienda online');
    expect(articles[2].textContent).toContain('revisión humana');
    expect(page.querySelectorAll('.living-system [data-module]').length).toBe(5);
    expect(page.querySelectorAll('.living-system').length).toBe(1);
  });
});
