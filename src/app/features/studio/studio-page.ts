import { afterNextRender, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { ConsultationCta } from '../../shared/consultation-cta/consultation-cta';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ProcessSteps } from '../../shared/process-steps/process-steps';

@Component({
  selector: 'app-studio-page',
  imports: [PageIntro, ConsultationCta, ProcessSteps],
  templateUrl: './studio-page.html',
  styleUrl: './studio-page.css',
})
export class StudioPage {
  readonly principles = [
    {
      title: $localize`:@@studioPage.principle1V2:Una solución propia, no una receta.`,
      text: $localize`:@@studioPage.principle1Copy:Diseñamos según tus procesos y sistemas actuales. Acordamos qué construir primero y qué dejar para después.`,
    },
    {
      title: $localize`:@@studioPage.principle2V2:Código que se pueda entender y mantener.`,
      text: $localize`:@@studioPage.principle2Copy:Arquitectura clara, pruebas y documentación para mantener, integrar y hacer evolucionar el software.`,
    },
    {
      title: $localize`:@@studioPage.principle3V2:Comunicación directa. Decisiones compartidas.`,
      text: $localize`:@@studioPage.principle3Copy:Revisamos avances con vos. Cada entrega permite probar el uso y ajustar prioridades.`,
    },
    {
      title: $localize`:@@studioPage.principle4V2:IA cuando aporta valor. Control donde importa.`,
      text: $localize`:@@studioPage.principle4Copy:Definimos qué datos puede usar la IA y qué acciones necesitan aprobación humana.`,
    },
  ];

  readonly expect = [
    $localize`:@@studioPage.expect1:Software diseñado alrededor de tu operación.`,
    $localize`:@@studioPage.expect2:Contacto directo con quien construye.`,
    $localize`:@@studioPage.expect3:Decisiones técnicas explicadas en términos de tu negocio.`,
    $localize`:@@studioPage.expect4:IA con límites claros y control humano.`,
  ];

  readonly avoid = [
    $localize`:@@studioPage.avoid1:Plantillas genéricas presentadas como desarrollo a medida.`,
    $localize`:@@studioPage.avoid2:Automatizaciones o chatbots sin un problema que resolver.`,
    $localize`:@@studioPage.avoid3:Intermediarios entre vos y quien desarrolla.`,
    $localize`:@@studioPage.avoid4:Trabajo sin alcance ni prioridades acordadas.`,
  ];

  constructor() {
    const host: ElementRef<HTMLElement> = inject(ElementRef);
    const destroyRef = inject(DestroyRef);
    // The system is drawn into the plan once the figure is in view (CSS transitions, no engine).
    afterNextRender(() => {
      const figure = host.nativeElement.querySelector('.blueprint');
      const still =
        matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.dataset['motion'] === 'reduced';
      if (!figure || still || typeof IntersectionObserver === 'undefined') return;
      figure.classList.add('will-draw');
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          figure.classList.add('is-drawn');
          observer.disconnect();
        },
        { threshold: 0.4 },
      );
      observer.observe(figure);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
