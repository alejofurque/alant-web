import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useMotion } from '../../../core/motion/motion-runtime';
import { Arrow } from '../../../shared/arrow/arrow';
import { MotionToggle } from '../../../shared/motion-toggle/motion-toggle';
import { Plane, PlaneKind } from '../../../shared/plane/plane';
import { mountShowcase } from './showcase.motion';

interface ShowcaseService {
  id: string;
  index: string;
  plane: PlaneKind;
  contactType: string;
  need: string;
  hint: string;
  name: string;
  title: string;
  lede: string;
  items: string[];
  ideal: string;
  cta: string;
}

@Component({
  selector: 'app-showcase',
  imports: [RouterLink, Arrow, MotionToggle, Plane],
  templateUrl: './showcase.html',
  styleUrls: ['./showcase.css', './showcase-stage.css'],
})
export class Showcase {
  /** 0 = hero composition, 1–3 = the service currently read. */
  readonly state = signal(0);
  /** Pauses the looping flow animation while the stage is off screen. */
  readonly paused = signal(true);

  readonly captions = [
    { code: '00', label: $localize`:@@showcase.caption0:Tres servicios, un mismo estándar` },
    { code: '01', label: $localize`:@@showcase.caption1:Desarrollo web` },
    { code: '02', label: $localize`:@@showcase.caption2:Software a medida` },
    { code: '03', label: $localize`:@@showcase.caption3:Automatización e IA` },
  ];

  readonly services: ShowcaseService[] = [
    {
      id: 'web',
      index: '01',
      plane: 'web',
      contactType: 'web',
      need: $localize`:@@showcase.web.need:Una web profesional`,
      hint: $localize`:@@showcase.web.hint:Sitios y páginas`,
      name: $localize`:@@showcase.web.name:Desarrollo web`,
      title: $localize`:@@showcase.web.title:Una web a la altura de tu empresa.`,
      lede: $localize`:@@showcase.web.lede:Sitios corporativos y páginas profesionales que explican con claridad qué hacés, transmiten confianza y facilitan que te contacten. Rápidos, accesibles y preparados para buscadores.`,
      items: [
        $localize`:@@showcase.web.item1:Sitios corporativos`,
        $localize`:@@showcase.web.item2:Páginas para un servicio o lanzamiento`,
        $localize`:@@showcase.web.item3:Formularios, reservas y consultas`,
        $localize`:@@showcase.web.item4:Funciones comerciales a medida`,
      ],
      ideal: $localize`:@@showcase.web.ideal:necesitás tu primera web profesional o renovar una que ya no representa a tu empresa.`,
      cta: $localize`:@@showcase.web.cta:Quiero una web profesional`,
    },
    {
      id: 'sistemas',
      index: '02',
      plane: 'system',
      contactType: 'software',
      need: $localize`:@@showcase.system.need:Un sistema a medida`,
      hint: $localize`:@@showcase.system.hint:Gestión y plataformas`,
      name: $localize`:@@showcase.system.name:Software a medida`,
      title: $localize`:@@showcase.system.title:Un sistema propio, pensado para cómo trabajás.`,
      lede: $localize`:@@showcase.system.lede:Sistemas de gestión, portales y herramientas internas que reemplazan planillas dispersas, ordenan la información y le dan a tu equipo un solo lugar para trabajar.`,
      items: [
        $localize`:@@showcase.system.item1:Sistemas de gestión`,
        $localize`:@@showcase.system.item2:Portales para clientes y proveedores`,
        $localize`:@@showcase.system.item3:Herramientas internas con permisos por rol`,
        $localize`:@@showcase.system.item4:Paneles de seguimiento y productos digitales`,
      ],
      ideal: $localize`:@@showcase.system.ideal:tu operación ya no entra en planillas o un software genérico te obliga a trabajar a su manera.`,
      cta: $localize`:@@showcase.system.cta:Quiero un sistema a medida`,
    },
    {
      id: 'automatizacion',
      index: '03',
      plane: 'flow',
      contactType: 'automatizacion',
      need: $localize`:@@showcase.flow.need:Automatizar tareas`,
      hint: $localize`:@@showcase.flow.hint:Integraciones e IA`,
      name: $localize`:@@showcase.flow.name:Automatización, integraciones e IA`,
      title: $localize`:@@showcase.flow.title:Que las tareas repetitivas se hagan solas.`,
      lede: $localize`:@@showcase.flow.lede:Conectamos las herramientas que ya usás —ventas, gestión, pagos, email o WhatsApp— y automatizamos los pasos que hoy se hacen a mano. Sumamos inteligencia artificial cuando aporta un beneficio real, con control humano donde importa.`,
      items: [
        $localize`:@@showcase.flow.item1:Integración entre sistemas y plataformas`,
        $localize`:@@showcase.flow.item2:Flujos de pedidos, documentos y mensajes`,
        $localize`:@@showcase.flow.item3:Asistentes con IA sobre información autorizada`,
        $localize`:@@showcase.flow.item4:Avisos y reportes automáticos`,
      ],
      ideal: $localize`:@@showcase.flow.ideal:tu equipo carga los mismos datos en varios lugares o responde siempre las mismas consultas.`,
      cta: $localize`:@@showcase.flow.cta:Quiero automatizar procesos`,
    },
  ];

  constructor() {
    const host = inject(ElementRef<HTMLElement>);
    const destroyRef = inject(DestroyRef);

    // Reading position drives captions, the gauge and the static (reduced-motion) poses.
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const root = host.nativeElement as HTMLElement;
      const steps = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting)
              this.state.set(Number((entry.target as HTMLElement).dataset['step']));
        },
        { rootMargin: '-50% 0px -50% 0px' },
      );
      root.querySelectorAll('[data-step]').forEach((step) => steps.observe(step));
      const visibility = new IntersectionObserver(([entry]) =>
        this.paused.set(!entry.isIntersecting),
      );
      visibility.observe(root.querySelector('.stage')!);
      destroyRef.onDestroy(() => {
        steps.disconnect();
        visibility.disconnect();
      });
    });

    useMotion(host, mountShowcase);
  }
}
