import type { PlaneKind } from '../../shared/plane/plane';

export interface ServiceDetail {
  /** Fragment on /servicios and value of `tipo` on /contacto. */
  readonly id: 'web' | 'software' | 'automatizacion';
  readonly index: string;
  readonly plane: PlaneKind;
  readonly name: string;
  readonly hint: string;
  /** One line that sells the service at a glance. */
  readonly value: string;
  readonly title: string;
  readonly lede: string;
  readonly now: string;
  readonly after: string;
  readonly items: readonly string[];
  readonly cta: string;
}

// Same three services and order as the home. Examples are project types, not client work.
export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  {
    id: 'web',
    index: '01',
    plane: 'web',
    name: $localize`:@@showcase.web.name:Desarrollo web`,
    hint: $localize`:@@showcase.web.hint:Sitios y páginas`,
    value: $localize`:@@services.web.value:Una web clara y rápida que genera consultas.`,
    title: $localize`:@@services.web.titleV3:Una web que explica qué hacés.`,
    lede: $localize`:@@services.web.ledeV3:Sitios y páginas a medida: claros para tus clientes, rápidos y preparados para buscadores.`,
    now: $localize`:@@services.web.now:Una web lenta o que no te representa.`,
    after: $localize`:@@services.web.after:Una web clara, rápida y fácil de contactar.`,
    items: [
      $localize`:@@showcase.web.item1:Sitios corporativos`,
      $localize`:@@services.web.item2:Landing pages`,
      $localize`:@@services.web.item3:Formularios y reservas`,
      $localize`:@@services.web.item4:Catálogos de productos`,
      $localize`:@@services.web.item5:Rediseño de sitios existentes`,
      $localize`:@@services.web.item6:Sitios en varios idiomas`,
    ],
    cta: $localize`:@@home.examples.web.cta:Consultar por una web`,
  },
  {
    id: 'software',
    index: '02',
    plane: 'system',
    name: $localize`:@@showcase.system.name:Software a medida`,
    hint: $localize`:@@showcase.system.hint:Gestión y plataformas`,
    value: $localize`:@@services.software.value:Un sistema propio para ordenar tu operación.`,
    title: $localize`:@@services.software.titleV3:Un sistema pensado para tu equipo.`,
    lede: $localize`:@@services.software.ledeV3:Gestión, portales y herramientas internas con los permisos y reglas de tu operación.`,
    now: $localize`:@@services.software.now:Planillas y mensajes que ya no alcanzan.`,
    after: $localize`:@@services.software.after:Un solo lugar para trabajar, con estados claros.`,
    items: [
      $localize`:@@services.software.item1:Gestión de pedidos`,
      $localize`:@@services.software.item2:Portales de clientes`,
      $localize`:@@services.software.item3:Herramientas internas`,
      $localize`:@@services.software.cap4:Paneles de seguimiento`,
      $localize`:@@services.software.cap5:MVPs y productos digitales`,
      $localize`:@@services.software.cap6:Modernización de sistemas`,
    ],
    cta: $localize`:@@home.examples.software.cta:Consultar por un sistema`,
  },
  {
    id: 'automatizacion',
    index: '03',
    plane: 'flow',
    name: $localize`:@@services.automation.name:Automatización e IA`,
    hint: $localize`:@@showcase.flow.hint:Integraciones e IA`,
    value: $localize`:@@services.automation.value:Menos tareas manuales y sistemas conectados.`,
    title: $localize`:@@services.automation.titleV3:Que las tareas repetitivas se hagan solas.`,
    lede: $localize`:@@services.automation.ledeV3:Conectamos tus herramientas y automatizamos los pasos manuales. IA solo donde aporta, con control humano.`,
    now: $localize`:@@services.automation.now:Datos cargados dos veces y transcripciones a mano.`,
    after: $localize`:@@services.automation.after:Información que fluye sola y se revisa cuando importa.`,
    items: [
      $localize`:@@services.automation.item1:Integraciones (APIs)`,
      $localize`:@@services.automation.item2:ERP y CRM`,
      $localize`:@@services.integration.cap4:Pasarelas de pago`,
      $localize`:@@services.automation.item4:Lectura de documentos`,
      $localize`:@@services.automation.item5:Asistentes con IA`,
      $localize`:@@services.automation.item6:WhatsApp y email`,
    ],
    cta: $localize`:@@home.examples.automation.cta:Consultar por automatización`,
  },
];

export const COMPLEMENTARY = [
  {
    title: $localize`:@@services.extra.support:Mantenimiento y soporte`,
    text: $localize`:@@services.extra.supportTextV2:Cuidamos y actualizamos lo que construimos.`,
  },
  {
    title: $localize`:@@services.extra.evolution:Evolución`,
    text: $localize`:@@services.extra.evolutionText:Sumamos funciones y mejoras según el uso real.`,
  },
  {
    title: $localize`:@@services.extra.infra:Publicación e infraestructura`,
    text: $localize`:@@services.extra.infraTextV2:Dejamos tu software publicado y funcionando.`,
  },
  {
    title: $localize`:@@services.extra.modern:Modernización`,
    text: $localize`:@@services.extra.modernTextV2:Actualizamos sistemas existentes sin empezar de cero.`,
  },
];

export const SERVICE_FAQ = [
  {
    q: $localize`:@@services.faq.q1:¿Necesito tener todo definido para consultar?`,
    a: $localize`:@@services.faq.a1V2:No. Contanos qué pasa hoy y qué querés lograr; el alcance lo definimos juntos.`,
  },
  {
    q: $localize`:@@services.faq.q2:¿Cuánto cuesta un proyecto?`,
    a: $localize`:@@services.faq.a2V2:Depende del alcance. Antes de empezar te enviamos una propuesta con alcance, etapas y costo.`,
  },
  {
    q: $localize`:@@services.faq.q3:¿Pueden trabajar con los sistemas que ya usamos?`,
    a: $localize`:@@services.faq.a3V2:Partimos de lo que ya usás y te decimos qué es posible antes de acordar el alcance.`,
  },
  {
    q: $localize`:@@services.faq.q4:¿Cómo usan la inteligencia artificial?`,
    a: $localize`:@@services.faq.a4:Solo donde aporta un beneficio concreto. Definimos qué datos puede usar y qué acciones necesitan aprobación humana.`,
  },
];
