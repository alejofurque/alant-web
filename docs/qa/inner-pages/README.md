# Páginas internas en el sistema «A medida»

Fecha: 24/11/2026. Rama: `claude/creative-direction`, sin commits. Continúa [el rediseño de la homepage](../creative-direction/README.md). No se publicó nada ni se tocaron DNS, credenciales, proveedores de contacto ni variables de entorno.

## Diagnóstico de la versión anterior

- **Servicios** describía tres servicios distintos a los de la home: *Software Engineering / Systems Integration / AI & Automation*, con nombres en inglés y sin desarrollo web. Un visitante que llegaba desde la home por «Una web profesional» no encontraba su servicio.
- **Estudio** y **Contacto** usaban el lenguaje visual anterior: cajas con borde y diagramas de cajas genéricos. Cerraban con un CTA oscuro distinto al de la home.
- **Contacto** abría con un recuadro «Escribinos / Ir al formulario» que solo enlazaba al formulario de al lado. No decía qué pasa después de escribir.

## Qué cambió

**Piezas compartidas**
- `PageIntro`: apertura oscura con H1 en dos tonos, entrada del titular y una regla medida que se dibuja como cierre. Es el mismo lenguaje que la home: cotas, reglas y mono.
- `ConsultationCta`: el cierre mint de la home. «Una buena solución empieza por *entender* el problema», con la cota bajo «entender».
- `ProcessSteps`: «Cómo trabajamos» sale de la home y se reutiliza en Estudio. Antes había dos versiones del proceso.
- Primitivas globales en `styles.css`: `.wrap`, `.kicker`, `.section-head`, `.section-lede`, `.measure`, `.text-cta`, `.cta-solid`, `.rise`.
- `Plane` pasó de `home/plane` a `shared/plane` porque ahora lo usan la home y Servicios.

**Servicios (`/servicios`)**
- Mismos tres servicios y mismo orden que la home: **Desarrollo web, Software a medida, Automatización, integraciones e IA**. Los anclajes son `#web`, `#software` y `#automatizacion`, y coinciden con `?tipo=` del contacto.
- Índice de servicios dentro de la apertura.
- Cada servicio incluye:
  - título orientado al beneficio y bajada;
  - el par **Situación habitual → Cómo lo resolvemos**;
  - seis proyectos posibles y «Ideal si…»;
  - CTA al contacto con el tipo ya elegido.
- A la derecha, el plano conceptual del servicio sobre una «placa de dibujo» con grilla, regla y marcas de corte. Al entrar en pantalla, el plano se endereza desde un ángulo de dibujo.
- Secciones nuevas:
  - **Además**: mantenimiento, evolución, publicación y modernización (los servicios complementarios del brief).
  - **Preguntas frecuentes**: cinco respuestas armadas con frases que ya estaban en el sitio. No hay precios, plazos ni promesas nuevas.
- Desde la home, cada servicio tiene ahora un enlace «Ver en detalle» a su sección en `/servicios`.

**Estudio (`/estudio`)**
- «El software tiene que entender el negocio» se ilustra con un **plano de la operación**: áreas de una empresa (Ventas, Administración, Depósito, Clientes, Reparto) con cotas, y el sistema en mint trazado dentro de ese plano. Está rotulado «Esquema ilustrativo».
- Proceso compartido, cuatro principios (texto existente) y una sección nueva, **«Un estudio de ingeniería, no una agencia»**. Tiene dos columnas: «lo que vas a encontrar» y «lo que no vas a encontrar». Sale del «No somos» del brief.

**Contacto (`/contacto`)**
- En móvil el **formulario va primero**.
- **«Qué pasa después»**:
  1. leemos tu consulta;
  2. coordinamos una conversación;
  3. te enviamos una propuesta con alcance, etapas y prioridades.
- Sin plazos de respuesta, porque no están confirmados.
- Las preguntas de preparación y la guía descargable se mantienen.
- El formulario solo cambió de estilo: tarjeta, campos, foco mint visible y botón oscuro. No se tocaron la lógica, la validación, el gateway ni los textos legales. Sigue deshabilitado mientras el envío no esté configurado.

## Iteración final: menos texto, valor a primera vista (25/11/2026)

Pedido del propietario: «mucho texto poco ordenado», que el valor se vea rápido, hover en tarjetas, compacto y profesional.

- **Servicios.**
  - Debajo de la apertura, **tres tarjetas** (una por servicio), cada una con su línea de valor: «Una web clara y rápida que genera consultas»; «Un sistema propio para ordenar tu operación»; «Menos tareas manuales y sistemas conectados».
  - Cada servicio quedó en: título corto, una bajada, **Hoy → Con ALANT** en dos tarjetas, seis etiquetas y el CTA.
  - Se eliminaron los párrafos de situación y solución, «Ideal si…» y una pregunta frecuente. Las respuestas se acortaron.
- **Estudio y home.** «Lo que sostiene cada sistema» y «Por qué ALANT» pasan a tarjetas 2×2.
- **Hover (solo CSS, respeta movimiento reducido).**

| Elemento | Efecto |
| --- | --- |
| Tarjetas (`.tile`, primitiva global) | Se elevan 4 px y dibujan un borde mint arriba |
| Tarjetas de servicio | La flecha se rellena de mint |
| Plano conceptual | Gira levemente, como si se levantara de la placa |
| Etiquetas | Se marcan |
| Preguntas frecuentes, pasos de contacto y lista «Lo que vas a encontrar» | Se desplazan |
| Proyectos de la home | Muestran un marcador mint |

- **Ajuste técnico.** El reveal de GSAP en la home ahora libera `transform` al terminar; si no, el estilo inline bloqueaba el hover de las tarjetas.
- **Lighthouse móvil** (build con gzip, 2 corridas): Servicios, Estudio y Contacto dan 95 de rendimiento, 100 de accesibilidad y CLS 0. LCP de 2,4 a 2,6 s. La carga de la máquina varía entre sesiones, así que conviene confirmarlo en un Preview de Vercel.

## Movimiento y rendimiento

Una primera versión cargaba GSAP (unos 45 kB) en Servicios y Estudio. En Lighthouse sumaba unos 0,7 s de LCP. Se reemplazó por CSS:

| Efecto | Implementación |
| --- | --- |
| Planos que se enderezan | Animación ligada al scroll (`view-timeline` por sección) |
| Regla del proceso | Animación ligada al scroll sobre los pasos |
| Entradas de bloques (`.rise`) | Desplazamiento ligado al scroll, **sin fundido** (un fundido dejaba semitransparente el texto en el borde del viewport y fallaba el contraste) |
| Plano de Estudio | `IntersectionObserver` + transiciones CSS, una sola vez |
| Flujo automático | Se pausa cuando su placa sale de pantalla |

- **Sin soporte, sin JavaScript o con movimiento reducido:** todo queda en su estado final, estático.
- **Firefox:** todavía no soporta animaciones ligadas al scroll sin flag, así que ve la versión estática.
- **Hallazgo:** Angular no renombra los `@keyframes` del componente si el `animation` está dentro de `@supports`. Por eso el shorthand queda fuera y solo `animation-timeline` va dentro (está comentado en el CSS).

Lighthouse móvil, build estático local servido con gzip, 2 corridas por página y versión, promedios (`measurements.json`):

| Página | Versión | Perf. | A11y | BP | SEO | FCP | LCP | TBT | CLS | Transfer. |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Servicios | anterior | 91 | 100 | 100 | 100 | 2,18 s | 2,69 s | 209 ms | 0 | 260 kB |
| Servicios | nueva | 91 | 100 | 100 | 100 | 2,35 s | 2,68 s | 195 ms | 0 | 265 kB |
| Estudio | anterior | 92 | 100 | 100 | 100 | 2,10 s | 2,55 s | 203 ms | 0 | 256 kB |
| Estudio | nueva | 91 | 100 | 100 | 100 | 2,24 s | 2,54 s | 226 ms | 0 | 265 kB |
| Contacto | anterior | 85 | 100 | 96 | 100 | 2,31 s | 3,05 s | 297 ms | 0 | 266 kB |
| Contacto | nueva | 83 | 100 | 96 | 100 | 2,34 s | 3,13 s | 360 ms | 0 | 276 kB |

- **Lectura:** rendimiento a la par. Las diferencias de 1 a 2 puntos y las de TBT están dentro de la variación entre corridas.
- **Best Practices 96 en Contacto (ambas versiones):** el servidor estático local no tiene `/api/contact`, y la consulta de configuración del formulario da 404 en consola. No ocurre en Vercel.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 30 tests aprobados (la prueba de la home ahora cubre los enlaces «Ver en detalle») |
| `npm run test:server` / `check:server` | 14 aprobados / sin errores |
| `npm run build` + postbuild | 5 rutas prerenderizadas, sin avisos de presupuesto |
| `npm run check:build` | 5 rutas, 118 enlaces locales (todos los anclajes existen). Comprobaciones nuevas: secciones e índice de Servicios, CTA con `tipo`, placas `aria-hidden` sin controles y rotuladas, FAQ, figura de Estudio rotulada y proceso |
| Prettier / `git diff --check` | Aprobado en los archivos tocados |
| Consola y overflow (Chrome headless) | Sin errores ni overflow en 1440, 1366, 768, 390 y 360 px (salvo el 404 de `/api/contact` en el servidor local) |
| Movimiento | Plano enderezándose, regla del proceso, plano de Estudio y contraste del CTA verificados en el navegador |

**Corregido durante la QA:**
- El CTA del servicio oscuro tenía texto claro sobre mint (contraste 1,3:1).
- El subtítulo de «Cómo trabajamos» en la home había perdido su margen por el reset del componente.
- Los encabezados de placa y los rótulos del plano eran ilegibles en móvil.
- Un `prettier --write` había reformateado componentes huérfanos; se restauraron.

## Material

- **Antes / después:**
  - desktop: [servicios](compare-servicios-desktop.jpg), [estudio](compare-estudio-desktop.jpg), [contacto](compare-contacto-desktop.jpg);
  - móvil: [servicios](compare-servicios-mobile.jpg), [estudio](compare-estudio-mobile.jpg), [contacto](compare-contacto-mobile.jpg).
- **Páginas completas** (movimiento reducido): `*-desktop-full.jpg`, `*-mobile-full.jpg`. Las de la versión anterior llevan prefijo `before-`.
- **Movimiento:** `servicios-*-entering.jpg` (plano inclinado) y `servicios-*.jpg` (plano asentado), [plano de Estudio](estudio-plano.jpg).
- **Scripts:** `capture.mjs`, `benchmark.mjs`.

## Pendientes reales

- Revisión del propietario en un navegador real, sobre todo el copy nuevo:
  - FAQ;
  - «Qué pasa después»;
  - «Lo que no vas a encontrar».
- **Orden de los servicios (decidido el 25/11/2026):** el desarrollo web queda primero en la home y en Servicios, por decisión del propietario, aunque el brief original pedía que no liderara el posicionamiento.
- **Componentes huérfanos para eliminar:**
  - `home/projects`, `home/services`, `home/contact`, `home/process`;
  - `shared/solution-preview` y `shared/project-card`.
- Publicar requiere aprobación; antes, repetir Lighthouse en un Preview de Vercel.
