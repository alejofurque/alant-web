# Pliegue integrado — validación final

Fecha: 28 de octubre de 2026. Validación local de builds de producción; sin push ni despliegue.

## Alcance

- La homepage usa el Pliegue aprobado, con sus tres planos CSS 3D y transformación reversible por scroll natural. Sin pinning, reproducción automática ni simulación de pedidos.
- Título, contenido comercial y CTA independientes de GSAP. Tres servicios explícitos: software a medida; automatización, integraciones e IA; desarrollo web.
- GSAP se carga mediante el runtime compartido existente. Contexto, media queries y ScrollTrigger se limpian al abandonar la página o desactivar movimiento. La preferencia del sistema tiene prioridad.
- La composición CSS completa existe en el prerender. El inicio de ScrollTrigger se limita a scroll cero para evitar empezar a mitad de la transformación con el header corporativo. Las poses compactas CSS/GSAP coinciden.
- Estilos de homepage encapsulados. Se conserva la corrección pendiente de hidratación i18n y el alcance de fuentes Tailwind limitado a `src`, evitando que los laboratorios o reportes alteren el CSS corporativo.
- Eliminados los antiguos componentes exclusivos Hero/SystemDiagram/Solutions y los experimentos no usados Blueprint/ProductScenes. Conservados Process (usado por Estudio), Projects/ProjectCard y SolutionPreview (usado por Servicios).
- Header, menú móvil, footer, rutas, metadata y páginas internas preservados. Sin cambios en contacto, API, servidor, variables ni Vercel.

## Validaciones

| Comprobación | Resultado |
| --- | --- |
| `node node_modules/@angular/cli/bin/ng.js build alant-web` | Correcto, 5 rutas prerenderizadas, sin advertencias de presupuesto |
| `node scripts/prepare-publication.mjs` | Correcto |
| `node scripts/check-build.mjs` | 5 rutas, 107 enlaces, canonical/metadata, i18n e hidratación correctos |
| `node node_modules/@angular/cli/bin/ng.js test alant-web --watch=false` | 30 tests, 8 archivos, correctos; retiradas 3 pruebas de escenas eliminadas |
| `node --experimental-strip-types --test server/*.test.ts` | 14 tests correctos |
| `node node_modules/typescript/bin/tsc -p server/tsconfig.json` | Correcto |
| `node scripts/check-function.mjs` | GET 200, POST 503 controlado con contacto deshabilitado, DELETE 405 |
| `git diff --check` | Sin errores |
| Navegador, build de producción | Desktop 1440×1000, tablet 768×1024 y móvil 390×844; sin desborde horizontal |
| Navegación | CTA a Contacto, Servicios, Estudio, volver a Inicio; ancla Soluciones a 100 px, por debajo del header |
| Teclado | Enter en controles, menú móvil abre con Enter y cierra con Escape devolviendo foco; toggle de movimiento funcional |
| Movimiento reducido | Al desactivar movimiento se revierten estilos de GSAP y queda la composición CSS completa; preferencia del sistema cubierta por tests del runtime |
| Reversibilidad | Matriz inicial idéntica después de avanzar y volver a scroll cero; ver `scroll-poses.json` |
| Consola homepage | Sin errores ni advertencias en la recarga final |
| Páginas internas | Contenido prerenderizado de Servicios, Estudio, Contacto y 404 idéntico a la base previa a esta integración |

El servidor estático local responde 503 deliberadamente en `/api`; no representa el estado del servicio de producción. No se enviaron correos ni se validó entrega real. La prueba de función usa configuración de prueba sin proveedores externos.

## Rendimiento

Medición con Lighthouse 13.5, Chrome 156 headless, Node 24.13, build optimizado y caché de navegador limpia por corrida. Tres corridas por variante, móvil 412×823, DPR 1,75, CPU ×4, red simulada RTT 150 ms / 1638,4 Kbps. Sin builds/tests simultáneos.

La primera serie en los servidores de revisión sin compresión obtuvo medianas de 86 (prototipo) y 71 (integración), ambas con CLS 0 y accesibilidad 100. Se conserva completa en `measurements-uncompressed.json`. Lighthouse identificó transferencia sin comprimir, con un bundle inicial corporativo mayor que el del prototipo aislado; no se atribuye esa diferencia a las transformaciones.

La serie comparable con transporte comprimido utiliza un único servidor local para las tres variantes: prototipo (`127.0.0.1:4305`), integración (`127.0.0.1:4306`) y homepage anterior guardada al comenzar (`127.0.0.1:4307`). HTML/CSS/JS gzip en todas, mismas cabeceras y ausencia de caché, sin cambiar código de aplicación ni configuración de despliegue. Las corridas se alternaron; tras el último ajuste exclusivo de contraste de foco se repitieron las tres mediciones de la integración sobre el build definitivo. Configuración y resultados completos en `measurements.json`.

Los resultados son de laboratorio local, no métricas de campo de Production. El prototipo y la página integrada comparten composición, pero la segunda incluye shell corporativo, navegación y servicios de Angular del sitio completo.

Medianas de la serie comprimida:

| Variante | Rendimiento | Accesibilidad | CLS | LCP | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| Prototipo Pliegue | 94 | 100 | 0 | 2,81 s | 16 ms |
| Homepage anterior | 91 | 100 | 0 | 2,86 s | 125 ms |
| Pliegue integrado final | 89 | 100 | 0 | 3,20 s | 101 ms |

La integración conserva CLS 0, reduce el bloqueo total respecto de la homepage anterior y pierde 2 puntos de rendimiento en esta comparación; el LCP queda 0,34 s por encima. No se presenta como una mejora absoluta de rendimiento. La referencia histórica de 81 no se usa como base directa porque no tenía idéntico transporte. El resultado final fue 89/100/0 en las tres corridas. Las series y sus condiciones se conservan para evitar ocultar la sensibilidad del resultado al transporte.

Bundle inicial integrado: 318,77 kB (91,02 kB de transferencia estimada); homepage diferida: 27,29 kB. GSAP y ScrollTrigger permanecen diferidos. No se incorporaron dependencias.

## Evidencia y límites

- `desktop.png`, `tablet.png`, `mobile.png`: homepage completa.
- `scroll-middle.png`, `scroll-end.png`, `scroll-poses.json`: transformación y reversibilidad.
- `reduced.png`, `mobile-menu.png`: escena estática y navegación móvil.
- `services.png`, `studio.png`, `contact.png`: páginas internas.
- La disponibilidad pública y recepción real del formulario no se reevaluaron: su implementación se conserva intacta.
- La configuración preexistente `publication.indexable=false` sigue vigente. Debe revisarse en el paso de publicación autorizado; esta integración no cambia políticas SEO de publicación.
- Los proyectos de laboratorio en `angular.json`, `labs/` y reportes anteriores son cambios preexistentes conservados fuera del commit. Por eso se especifica `alant-web` al ejecutar Angular en este checkout.
