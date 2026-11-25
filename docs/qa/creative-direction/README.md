# Dirección creativa «A medida»: rediseño de la homepage

Fecha: 24/11/2026. Rama: `claude/creative-direction` (creada desde `codex/creative-experience-lab`, sin commits). No se publicó nada ni se tocaron DNS, credenciales ni variables de entorno.

## Diagnóstico de la versión anterior

- El hero listaba categorías («Software. Automatización. Diseño digital.») en lugar de una propuesta de valor, y la escultura Pliegue era abstracta: transmitía calidad de diseño, pero no qué entrega ALANT.
- La home era corta y no respondía «¿pueden hacer lo que necesito?» ni «¿por qué confiar?». Tenía tres tarjetas pequeñas, una frase institucional y el CTA. No había ejemplos, proceso ni principios.
- «Soluciones» apuntaba a las mismas tarjetas de servicios.
- El formulario de contacto no tenía opción para quien busca una web, aunque el desarrollo web es uno de los tres servicios.

## Dirección

**Concepto: «A medida».** La expresión que el cliente ya busca («software a medida») se convierte en idea de marca. Se expresa con el lenguaje del dibujo técnico: cotas, reglas y marcas de corte. Es un sistema gráfico propio, sobrio y coherente con Precision Mint, sin robots, circuitos ni gradientes.

- **H1:** «Software hecho a medida.» Una cota mint se dibuja bajo «a medida», el punto final es mint (eco del wordmark ALANT.).
- **Los tres planos de Pliegue (papel, graphite y mint) se conservan como material, pero ahora son los productos:** una web, un sistema de gestión y un flujo automatizado, como interfaces conceptuales rotuladas y construidas en HTML/CSS/SVG propios.
- **Escenario fijo con scroll:** en el hero, los tres planos reposan sobre un piso técnico con reglas. Al bajar, el scroll los reordena en profundidad y adelanta el plano del servicio que se está leyendo. Los demás quedan atrás como un mazo sólido, oscurecido por la distancia. Funciona en ambos sentidos y no fija la página ni agrega longitud de scroll.
- **Movimiento con propósito:** entrada del titular y la cota; los planos se elevan desde el piso; una inclinación leve sigue al puntero (solo con puntero fino); un «pedido» recorre el flujo automático y se pausa fuera de pantalla; la regla del proceso se llena con el scroll.

## Cambios comerciales

1. **Primer viewport:** qué hacemos (H1 + bajada concreta), CTA principal y **«¿Qué necesitás?»** con tres entradas en el lenguaje del cliente: *Una web profesional / Un sistema a medida / Automatizar tareas*.
2. **Un bloque por servicio:** título orientado al beneficio, bajada sin tecnicismos, cuatro ejemplos concretos, la línea «Ideal si…» para que el visitante se reconozca y un CTA que abre el contacto con el tipo de proyecto ya elegido (`/contacto?tipo=web|software|automatizacion`).
3. **«Qué podemos construir»** (`#soluciones`): índice de 15 proyectos habituales en tres columnas. Son proyectos posibles, no casos de clientes.
4. **«Cómo trabajamos»:** cuatro etapas con el resultado que recibe el cliente en cada una.
5. **«Por qué ALANT»:** cuatro principios ya presentes en la página Estudio (contacto directo, alcance claro, código mantenible, IA con control humano). No se agregaron afirmaciones nuevas sobre el negocio.
6. **Cierre:** «¿Qué necesitás construir?» con CTA y tres accesos rápidos al contacto.
7. **Contacto:** nueva opción «Sitio o plataforma web» (`web`) en el formulario y en la validación del servidor. Es aditiva: no cambia proveedores, destinatarios ni secretos.

No se inventaron clientes, métricas, testimonios ni certificaciones. Los datos de las interfaces son ilustrativos y el escenario lo indica («Interfaces conceptuales»).

## Implementación

| Archivo | Rol |
| --- | --- |
| `src/app/features/home/showcase/*` | Hero, servicios, escenario fijo, poses y motion (GSAP/ScrollTrigger, carga diferida existente) |
| `src/app/features/home/plane/*` | Los tres planos conceptuales, diseñados en `em` para escalar exacto en cualquier tamaño |
| `src/app/features/home/home.*`, `home-sections.css`, `home.motion.ts` | Índice, proceso, principios, cierre y apariciones al hacer scroll |
| `server/contact-validation.ts`, `contact-form.ts` | Tipo de proyecto `web` |
| `scripts/check-build.mjs`, `home.spec.ts` | Comprobaciones actualizadas a la nueva estructura |
| `angular.json` | Presupuesto de estilos por componente: aviso 4→8 kB y error 8→12 kB (el CSS de los planos ocupa 7 kB) |
| `src/locale/messages.xlf` | Re-extraído con `npm run i18n:extract` |

Se eliminó Pliegue (`home/pliegue/*`) y los CSS anteriores de la home. Siguen en el historial de git. No se tocaron los componentes huérfanos `home/projects`, `home/services` y `home/contact`, ni las páginas internas.

**Movimiento reducido:** con `prefers-reduced-motion` o con el switch del escenario, GSAP no se carga y el escenario cambia de composición sin animar (poses estáticas en CSS). La animación del flujo se detiene. Sin JavaScript, se ve la composición del hero.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 30 tests, 8 archivos: aprobados |
| `npm run test:server` / `check:server` | 14 tests aprobados / sin errores |
| `npm run build` + postbuild | 5 rutas prerenderizadas, sin avisos de presupuesto; función: GET 200, POST 503, DELETE 405 (lo esperado sin configuración) |
| `npm run check:build` | 5 rutas, 116 enlaces locales, metadatos, formulario y fallback |
| Prettier | Aprobado en los archivos tocados (4 archivos preexistentes de `home/process` y `home/services` siguen sin formato; no se tocaron) |
| Estados del escenario (Chrome headless) | 0→1→2→3→2→0 correctos al bajar y al subir |
| Consola / overflow horizontal | Sin errores, avisos ni overflow en 1440, 1366, 768, 390 y 360 px |

**Hallazgo durante la QA:** el H1 se leía «Software hechoa medida» para lectores de pantalla y buscadores. Se corrigió y el test lo cubre.

**Nota de desarrollo:** con `ng serve`, el servidor de desarrollo recrea el árbol del showcase después de hidratar. Los observadores quedaban en nodos huérfanos y el indicador de estado no avanzaba **solo en dev**. En el build de producción no ocurre (verificado con MutationObserver). Toda la QA visual se hizo sobre el build de producción.

## Rendimiento

Lighthouse móvil (perfil por defecto), build estático local servido con gzip (como Vercel), 3 corridas por versión, promedios (`measurements.json`):

| Versión | Perf. | A11y | BP | SEO | FCP | LCP | TBT | CLS | Transferencia |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Anterior (HEAD `e95292e`) | 92 | 100 | 100 | 100 | 2,25 s | 2,89 s | 105 ms | 0 | 303 kB |
| Nueva | 89 | 100 | 100 | 100 | 2,53 s | 3,22 s | 67 ms | 0 | 319 kB |

Lectura honesta: la página tiene unas tres veces más contenido. El HTML prerenderizado pasó de 9 a 15 kB comprimido, con más CSS inline. Eso suma unos 0,3 s a FCP y LCP en la simulación de 4G lenta. El TBT mejoró, CLS sigue en 0 y accesibilidad, buenas prácticas y SEO en 100. Ya se difieren los planos que solo usa móvil (`@defer on viewport`). Si se quiere recuperar ese margen, el siguiente paso sería aligerar el CSS de los planos. No se midieron FPS ni dispositivos físicos.

## Material de revisión

- Comparación: [hero desktop](compare-desktop-hero.jpg), [hero móvil](compare-mobile-hero.jpg), [home anterior completa](before-desktop-full.jpg).
- Desktop 1440: [hero](desktop-hero.jpg), [web](desktop-web.jpg), [sistema](desktop-sistemas.jpg), [automatización](desktop-automatizacion.jpg), [índice](desktop-soluciones.jpg), [proceso](desktop-proceso.jpg), [cierre](desktop-closing.jpg), [movimiento reducido](desktop-reduced-sistemas.jpg).
- Laptop 1366: [hero](laptop-1366-hero.jpg), [sistema](laptop-1366-sistemas.jpg). Tablet 768: [hero](tablet-hero.jpg), [completa](tablet-full.jpg).
- Móvil 390/360: `mobile-390-*.jpg`, `mobile-360-*.jpg` (hero, escultura, servicios, índice, proceso, contacto y página completa).
- Grabaciones: [desktop](desktop-interactions.mp4) (entrada, puntero, recorrido de servicios en ambos sentidos, índice, proceso y cierre) y [móvil](mobile-interactions.mp4). Son screencast de Chrome headless con cuadros irregulares: **no sirven para juzgar la fluidez**. Para eso, revisar en el navegador.
- Scripts reproducibles: `capture.mjs`, `record.mjs`, `benchmark.mjs`.

## Pendientes reales

- Revisión del propietario en un navegador real (desktop y teléfono) y decisión sobre el copy.
- Publicar requiere aprobación. Antes, repetir Lighthouse en un Preview de Vercel.
- Las páginas internas (Servicios, Estudio, Contacto) mantienen el diseño anterior: conviene alinearlas al sistema «A medida» en una fase siguiente.
- Componentes huérfanos `home/projects`, `home/services` y `home/contact`: candidatos a eliminar.
