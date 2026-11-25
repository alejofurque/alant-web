import { Component, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useMotion } from '../../core/motion/motion-runtime';
import { mountReveals } from '../../core/motion/reveal';
import { Arrow } from '../../shared/arrow/arrow';
import { ProcessSteps } from '../../shared/process-steps/process-steps';
import { Showcase } from './showcase/showcase';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Arrow, Showcase, ProcessSteps],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-sections.css'],
})
export class Home {
  // Illustrative project types, not client work.
  readonly examples = [
    {
      type: 'web',
      index: '01',
      name: $localize`:@@home.examples.web:Web`,
      need: $localize`:@@home.examples.web.need:Necesito una web`,
      cta: $localize`:@@home.examples.web.cta:Consultar por una web`,
      items: [
        $localize`:@@home.examples.web.1:Sitio corporativo`,
        $localize`:@@home.examples.web.2:Página para un servicio o lanzamiento`,
        $localize`:@@home.examples.web.3:Web con reservas y formularios`,
        $localize`:@@home.examples.web.4:Catálogo de productos`,
        $localize`:@@home.examples.web.5:Rediseño de un sitio existente`,
      ],
    },
    {
      type: 'software',
      index: '02',
      name: $localize`:@@home.examples.software:Sistemas`,
      need: $localize`:@@home.examples.software.need:Necesito un sistema`,
      cta: $localize`:@@home.examples.software.cta:Consultar por un sistema`,
      items: [
        $localize`:@@home.examples.software.1:Gestión de pedidos y clientes`,
        $localize`:@@home.examples.software.2:Portal para clientes o proveedores`,
        $localize`:@@home.examples.software.3:Control de stock y depósitos`,
        $localize`:@@home.examples.software.4:Herramienta interna para tu equipo`,
        $localize`:@@home.examples.software.5:Panel de seguimiento de la operación`,
      ],
    },
    {
      type: 'automatizacion',
      index: '03',
      name: $localize`:@@home.examples.automation:Automatización`,
      need: $localize`:@@home.examples.automation.need:Quiero automatizar`,
      cta: $localize`:@@home.examples.automation.cta:Consultar por automatización`,
      items: [
        $localize`:@@home.examples.automation.1:Pedidos de WhatsApp o email cargados al sistema`,
        $localize`:@@home.examples.automation.2:Facturas y documentos leídos automáticamente`,
        $localize`:@@home.examples.automation.3:Ventas sincronizadas con tu gestión`,
        $localize`:@@home.examples.automation.4:Avisos automáticos a clientes`,
        $localize`:@@home.examples.automation.5:Asistente con IA para consultas internas`,
      ],
    },
  ];

  readonly principles = [
    {
      title: $localize`:@@home.principle1.title:Hablás con quien construye.`,
      text: $localize`:@@home.principle1.text:Trabajás en contacto directo con quien desarrolla la solución, sin intermediarios.`,
    },
    {
      title: $localize`:@@home.principle2.title:Alcance claro desde el inicio.`,
      text: $localize`:@@home.principle2.text:Acordamos qué construir primero y explicamos cada decisión técnica en términos de tu negocio.`,
    },
    {
      title: $localize`:@@home.principle3.title:Código que se puede mantener.`,
      text: $localize`:@@home.principle3.text:Arquitectura clara, pruebas y documentación para que el software pueda crecer con tu empresa.`,
    },
    {
      title: $localize`:@@home.principle4.title:IA cuando aporta valor.`,
      text: $localize`:@@home.principle4.text:Definimos qué datos puede usar y qué acciones necesitan aprobación humana.`,
    },
  ];

  constructor() {
    useMotion(inject(ElementRef<HTMLElement>), mountReveals);
  }
}
