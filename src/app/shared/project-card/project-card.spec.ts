import { TestBed } from '@angular/core/testing';
import { ProjectCard } from './project-card';
import { ProjectCardData } from './project-card.model';

describe('Project showcase', () => {
  const details = {
    id: 'test-entry',
    category: 'Software',
    title: 'Contenido de prueba',
    problem: 'Necesidad documentada',
    solution: 'Solución documentada',
    technologies: ['Angular', 'TypeScript'],
  };

  it('identifies a reserved slot without fabricating a media asset or demo link', async () => {
    const fixture = TestBed.createComponent(ProjectCard);
    const placeholder: ProjectCardData = {
      ...details,
      status: 'placeholder',
      media: { kind: 'placeholder' },
      problem: null,
      solution: null,
      technologies: [],
    };
    fixture.componentRef.setInput('project', placeholder);
    await fixture.whenStable();
    const card = fixture.nativeElement as HTMLElement;
    expect(card.textContent).toContain('Espacio reservado');
    expect(card.textContent).toContain('No es una captura de un proyecto');
    expect(card.querySelector('img, video, a')).toBeNull();
    expect(card.textContent).toContain('Por confirmar con el material real.');
  });

  it('renders verified metadata, an accessible lazy image and an available link', async () => {
    const fixture = TestBed.createComponent(ProjectCard);
    const verified: ProjectCardData = {
      ...details,
      status: 'demo',
      media: {
        kind: 'image',
        src: '/favicon.svg',
        alt: 'Asset local usado por la prueba',
        width: 64,
        height: 64,
      },
      link: { href: '#soluciones', label: 'Ver contenido de prueba' },
    };
    fixture.componentRef.setInput('project', verified);
    await fixture.whenStable();
    const card = fixture.nativeElement as HTMLElement;
    expect(card.textContent).toContain('Demostración técnica');
    expect(card.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(card.querySelector('img')?.getAttribute('alt')).toBe(
      verified.media.kind === 'image' ? verified.media.alt : '',
    );
    expect(card.querySelector('a')?.getAttribute('href')).toBe('#soluciones');
    expect(card.querySelectorAll('.project-technologies li').length).toBe(2);
    expect(card.querySelector('.placeholder-canvas')).toBeNull();
  });

  it('keeps video playback user initiated and associates the supplied captions', async () => {
    const fixture = TestBed.createComponent(ProjectCard);
    const recording: ProjectCardData = {
      ...details,
      status: 'demo',
      media: {
        kind: 'video',
        src: '/test-fixtures/recording.mp4',
        poster: '/favicon.svg',
        description: 'Grabación usada sólo como fixture de prueba',
        width: 1280,
        height: 800,
        captions: { src: '/test-fixtures/captions.vtt', language: 'es', label: 'Español' },
      },
    };
    fixture.componentRef.setInput('project', recording);
    await fixture.whenStable();
    const card = fixture.nativeElement as HTMLElement;
    const video = card.querySelector('video');
    expect(video?.controls).toBe(true);
    expect(video?.autoplay).toBe(false);
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.getAttribute('aria-label')).toContain('fixture de prueba');
    expect(video?.querySelector('track')?.getAttribute('srclang')).toBe('es');
    expect(video?.querySelector('track')?.getAttribute('src')).toBe('/test-fixtures/captions.vtt');
    expect(card.querySelector('a')).toBeNull();
  });
});
