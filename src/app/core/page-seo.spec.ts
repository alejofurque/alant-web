import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { PageSeo } from './page-seo';
import publication from './publication.json';
import { afterEach } from 'vitest';
const original = { ...publication };
afterEach(() => Object.assign(publication, original));
describe('Corporate route metadata', () => {
  it('replaces metadata between lazy routes and handles unknown paths without redirecting to home', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: TitleStrategy, useClass: PageSeo }],
    });
    const harness = await RouterTestingHarness.create();
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of ['/', '/servicios', '/estudio', '/contacto']) {
      await harness.navigateByUrl(path);
      expect(harness.routeNativeElement?.querySelectorAll('h1').length).toBe(1);
      expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
        document.title,
      );
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
      titles.add(document.title);
      descriptions.add(
        document.querySelector('meta[name="description"]')!.getAttribute('content')!,
      );
    }
    expect(titles.size).toBe(4);
    expect(descriptions.size).toBe(4);
    await harness.navigateByUrl('/ruta-inexistente');
    expect(harness.routeNativeElement?.textContent).toContain('Esta pieza no está');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });
  it('builds canonical without queries and removes it for 404 pages', async () => {
    Object.assign(publication, { origin: 'https://example.test', indexable: true });
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: TitleStrategy, useClass: PageSeo }],
    });
    const harness = await RouterTestingHarness.create('/contacto?tipo=software');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.test/contacto',
    );
    await harness.navigateByUrl('/missing');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });
});
