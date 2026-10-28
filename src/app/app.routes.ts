import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: $localize`:@@home.pageTitle:ALANT — Software a medida, desarrollo web y automatización`,
    data: {
      description: $localize`:@@home.metaDescription:Software a medida, desarrollo web e integración de sistemas para empresas. ALANT — Software Engineering Studio: tecnología y automatización para tu operación.`,
    },
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/services/services-page').then((m) => m.ServicesPage),
    title: $localize`:@@servicesPage.metaTitle:Software, desarrollo web y automatización — Servicios ALANT`,
    data: {
      description: $localize`:@@servicesPage.metaDescription:Software empresarial a medida, desarrollo web, integración de sistemas y automatización con IA para los procesos de tu empresa.`,
    },
  },
  {
    path: 'estudio',
    loadComponent: () => import('./features/studio/studio-page').then((m) => m.StudioPage),
    title: $localize`:@@studioPage.metaTitle:El estudio — Ingeniería de software con criterio | ALANT`,
    data: {
      description: $localize`:@@studioPage.metaDescription:Un estudio boutique de ingeniería de software. Arquitectura, comunicación directa y soluciones construidas alrededor de cada empresa.`,
    },
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact-page').then((m) => m.ContactPage),
    title: $localize`:@@contactPage.metaTitle:Contacto — Contanos sobre tu proyecto | ALANT`,
    data: {
      description: $localize`:@@contactPage.metaDescription:Prepará tu consulta sobre software a medida, integración o automatización. Compartí el contexto de tu empresa y lo que necesitás construir.`,
    },
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: $localize`:@@notFound.metaTitle:Página no encontrada — ALANT`,
    data: {
      notFound: true,
      description: $localize`:@@notFound.description:Esta dirección no corresponde a una página de ALANT. Volvé al inicio o explorá nuestros servicios.`,
    },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: $localize`:@@notFound.metaTitle:Página no encontrada — ALANT`,
    data: {
      notFound: true,
      description: $localize`:@@notFound.description:Esta dirección no corresponde a una página de ALANT. Volvé al inicio o explorá nuestros servicios.`,
    },
  },
];
