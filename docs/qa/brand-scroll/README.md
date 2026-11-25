# ALANT — Pliegue: propuesta local de marca

Fecha de revisión: 27 de octubre de 2026 (Argentina).

## Alcance

La simulación de pedidos fue retirada de la homepage y aislada en `artifacts/hero-final/isolated-order-motion` (ignorado por Git). Panorama A vuelve a usar su panel estático aprobado. Se recompiló `alant-web`; su vista de 4302 ya sirve la versión estática.

La nueva propuesta vive exclusivamente en `labs/brand-scroll` y en el proyecto Angular `brand-scroll` de `angular.json`. No se importó desde las páginas corporativas. No se modificaron backend, contacto, variables, servicios externos ni Production. No se creó un commit de aprobación visual.

## Dirección

Una escultura de tres planos de gran escala, con espesor, vacíos, perspectiva y un acento mint. El scroll normal abre y recompone los planos, variando posición, orientación y escala; subir revierte la transformación. No hay pinning, autoplay, loops ni scroll añadido. La tipografía y los CTA permanecen fuera de la escena.

Mensaje comercial: software a medida, automatizaciones/integraciones/IA y sitios web. No se presentan productos, métricas ni proyectos ficticios. Las piezas gráficas son recursos de marca, no un isotipo final.

## Revisión

Abrir http://127.0.0.1:4304/ y bajar lentamente unos 300 px en escritorio. En móvil, la escena sigue al texto y se transforma al entrar en pantalla. El botón «Desactivar movimiento» restaura la composición CSS estática.

```powershell
node node_modules/@angular/cli/bin/ng.js build brand-scroll
node labs/brand-scroll/serve.mjs
```

El servidor es local, escucha únicamente en 127.0.0.1:4304 y no implementa API. Los enlaces de consulta apuntan a la página de contacto existente; no se envió ningún formulario.

## Evidencia

- `brand-live.mp4`: grabación de desplazamiento real de ida y vuelta, 176 capturas consecutivas en unos 9 segundos. Codificación a 24 fps conservando los tiempos de captura, sin interpolar movimiento. La resolución efectiva del navegador integrado limita la nitidez del video; no demuestra 60 fps.
- `desktop-start.png`, `desktop-middle.png`, `desktop-end.png`: capturas completas de los estados reales de escritorio, 1440 × 1000 de viewport.
- `mobile-start.png`, `mobile-middle.png`: revisión móvil, 390 × 844.
- `tablet.png`: revisión tablet, 768 × 1024.
- `reduced.png`: composición restaurada al desactivar movimiento por teclado.

## Validaciones

| Comando / comprobación | Resultado |
| --- | --- |
| `ng build alant-web` | OK; 5 rutas prerenderizadas; Panorama A estático |
| `ng build brand-scroll` | OK; 1 ruta prerenderizada; 168,40 kB iniciales, transferencia estimada 52,01 kB; GSAP diferido 41,04 kB transferidos |
| `ng test alant-web --watch=false` | 33/33 tests, 11 archivos |
| `node --experimental-strip-types --test server/*.test.ts` | 14/14 tests |
| `node scripts/prepare-publication.mjs` y `node scripts/check-build.mjs` | OK; 5 rutas, 107 enlaces locales; solo artefactos locales, sin despliegue |
| Navegador, escritorio/móvil/tablet | Composición y scroll revisados; sin desbordamiento horizontal en los anchos inspeccionados |
| Desactivar movimiento con Enter | OK; `aria-pressed=true`, transforms inline eliminados; scroll posterior mantiene la pose estática |
| Consola tras recompilar y recargar | Sin errores ni advertencias capturados |

La preferencia del sistema se consulta antes de importar GSAP, escucha cambios y revierte el contexto. El mismo estado estático está renderizado por SSG y CSS. Se verificó visualmente mediante el control de desactivación; no se cambió la preferencia del sistema operativo ni se ensayó un navegador con JavaScript globalmente bloqueado. No se probó Safari ni un teléfono físico. La destrucción cancela importaciones pendientes y revierte timeline/ScrollTrigger.

## Medición local de carga

Lighthouse 13.5.0, Chrome headless, build de producción local servido en 4304, perfil móvil por defecto (412 × 823, CPU ×4, RTT 150 ms y 1638,4 kbps). Una pasada, no una comparación estadística ni una medición de Production:

- Rendimiento: 81/100.
- Accesibilidad: 100/100.
- CLS: 0.
- LCP: 4,02 s.
- TBT: 43 ms.
- Best practices: 96/100 en esa pasada por una petición de favicon 404; se corrigió después con un favicon vacío explícito. No se volvió a puntuar Lighthouse tras ese cambio; consola posterior limpia.
- SEO: 60/100 por `noindex` deliberado en el laboratorio local.

Informe original: `lighthouse-mobile.json`. La carga todavía admite optimización antes de integrar; esta entrega es una primera propuesta visual para revisión, no una aprobación de rendimiento final.

## Referencias de implementación

Se aplicaron principios de [GSAP](https://github.com/iart-ai/web-animation-skills/tree/main/skills/gsap-web), [animación accesible](https://github.com/iart-ai/web-animation-skills/tree/main/skills/accessible-animation) y [rendimiento](https://github.com/iart-ai/web-animation-skills/tree/main/skills/60fps-animation): transformaciones de elementos acotados, timeline única, importación diferida, cleanup y composición estática completa. No se añadieron dependencias.

Pendiente: aprobación visual de esta propuesta antes de integrarla en la homepage real.
