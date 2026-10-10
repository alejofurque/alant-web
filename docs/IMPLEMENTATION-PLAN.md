# ALANT — Plan de implementación web (v1.0)

## Objetivo técnico
Construir una web de presentación B2B visualmente excepcional pero simple de mantener. Prioridad: homepage validada antes de ampliar páginas.

## Stack inicial
- Angular (versión estable soportada y compatible con el entorno; comprobar antes de instalar), standalone components, TypeScript estricto.
- Tailwind CSS v4 con integración oficial Angular vía PostCSS, más CSS para detalles de identidad y tokens.
- Angular SSG / prerendering para rutas corporativas; si se usa `ng new --ssr`, configurar salida estática (`outputMode: static`) para evitar un servidor innecesario.
- Angular i18n `@angular/localize`, `es` como idioma fuente; preparar la capacidad de `en`, pero no publicar traducciones falsas.
- Deploy final previsto: Vercel (configurar solamente al llegar a la fase de publicación).
- No backend ni CMS en MVP. Contacto mediante mecanismo simple y fiable a definir, sin exponer secretos del servidor.

Referencias oficiales a consultar según versiones realmente instaladas:
- https://angular.dev/guide/hybrid-rendering
- https://angular.dev/guide/i18n
- https://angular.dev/guide/i18n/deploy
- https://tailwindcss.com/docs/installation/framework-guides/angular

## Arquitectura sugerida (adaptar a estructura real)
```
src/
  app/
    core/                  # configuración global, SEO, i18n
    shared/                # botones, contenedores, navegación, footer
    features/
      home/                # secciones homepage
      services/            # próximo hito
      projects/            # próximo hito
      about/               # próximo hito
      contact/             # próximo hito
    app.routes.ts
    app.routes.server.ts   # si corresponde con SSG
  styles.css               # Tailwind + design tokens
  assets/                  # imágenes optimizadas propias
```

No crear componentes/servicios vacíos para futuras funcionalidades. Prefiere estructura progresiva.

## Hito 0 — Diagnóstico y setup
1. Inspeccionar archivos y entorno: evitar sobreescribir repositorios existentes.
2. Si no hay app, crear Angular nuevo con configuración mantenible.
3. Instalar Tailwind desde documentación actual; validar que compila.
4. Crear tokens de marca y tipografías con fallbacks.
5. Preparar renderizado estático, rutas y arquitectura para idioma inglés futuro.
6. Dejar comandos claros `dev`, `build` y `test` si aplican.
**Salida:** app levantando correctamente, estructura mínima y sin dependencias innecesarias.

## Hito 1 — Homepage (PRIMER ENTREGABLE VISUAL)
Implementar en componentes reutilizables:
- header y navegación responsive;
- hero tipográfico con diagrama/sistema visual modular auténtico;
- franja de capacidades;
- tres servicios;
- metodología/proceso;
- desafíos o casos de uso ilustrativos claramente etiquetados;
- CTA de contacto funcional según dato confirmado, footer.

Detalles: responsive, contraste, estados focus, scroll suave cuando no hay reduce motion, animaciones livianas, sin uso de screenshots como diseño.
**Salida:** homepage demostrable localmente y visualmente fiel al moodboard en sensaciones, no copia literal.
**ALTO:** no avanzar a páginas internas antes de recibir revisión/feedback del propietario.

## Hito 2 — Refinamiento visual
Revisar proporciones, tipografías, detalles, mobile, imagen del hero, velocidad y claridad comercial. Capturas desktop/mobile si la herramienta lo permite. Iterar con feedback.

## Hito 3 — Contenidos e internas
Crear Servicios, Proyectos/Demos, Estudio y Contacto, con contenido verificado. Crear al menos demos genuinas o placeholders explícitos, nunca clientes falsos.

## Hito 4 — SEO, traducciones y publicación
- Validar HTML prerenderizado, title/description/canonical/OG por ruta, robots y sitemap.
- Activar inglés cuando exista traducción completa y revisada; rutas localizadas y hreflang recíproco.
- Build final y pruebas responsive/accesibilidad/performance.
- Configurar hosting y dominio solo con autorización.

## Criterios de aceptación del primer hito
- [ ] Visualmente consistente con Precision Mint.
- [ ] Español natural, sin texto lorem ipsum y sin claims inventados.
- [ ] Navegación y CTAs utilizables, nada apunta a páginas inexistentes.
- [ ] Mobile 360/390px, tablet 768px, desktop 1440px revisados.
- [ ] Contraste y navegación teclado revisados.
- [ ] `ng build` exitoso (o explicar bloqueo real).
- [ ] No warnings graves, errores evidentes ni overflow horizontal.
- [ ] Preparación para i18n explicada/documentada.
- [ ] No se modifica DNS ni se despliega sin autorización.
- [ ] Se reportan comandos y resultados de verificación.
