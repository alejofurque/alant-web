# Iteración 8 — Engineered Motion

Primera experiencia para revisión visual. Rama `codex/iteration-8-engineered-motion`, basada en `983cda3` de main. No se publicó ni se modificaron el backend, el contacto o sus variables.

## Auditoría y decisión

Se revisaron MotionLoader, MotionPreferences, useMotion, hero, SystemDiagram y Soluciones. El runtime ya carga GSAP únicamente en navegador, ejecuta fuera de Angular y revierte contextos y media queries al destruir componentes o reducir movimiento. La alternativa HTML/CSS queda disponible si falla la carga.

El titular usa una entrada de 0,9 s, 14 px y opacidad desde 0,68. El diagrama del hero tiene una secuencia de aproximadamente 5 s, una demora inicial de 0,35 s en desktop y repetición manual. No se modificaron en esta experiencia.

Soluciones ya movía módulos y conexiones mediante una timeline de 4,4 unidades ligada al scroll, con scrub de 0,55 s. Su condición de escritorio exigía más de 1000 px de ancho y al menos 800 px de alto. El panel tenía un canvas mínimo de 420 px, cabecera, resultado y descripción, más un offset sticky de 122 px. Esa protección evitaba recortar el panel, pero excluía notebooks de 768 y 720 px. Es una conclusión de las dimensiones y condiciones existentes, no una justificación histórica documentada.

La perspectiva y los registros independientes refuerzan el contraste entre fragmentación, integración y plataforma común. El movimiento conserva las mismas identidades de módulos; no añade ejemplos comerciales ni representa un cliente real.

## Tres propuestas presentadas

| Propuesta | Experiencia y utilidad | Complejidad / riesgo |
| --- | --- | --- |
| Arquitectura desplegada | Dar profundidad al hero, ensamblando capas y coordinando conexiones sin demorar su texto o CTA. | Media; riesgo moderado de composición y legibilidad. |
| Mesa de integración — elegida | Registros y sistemas dispersos se ordenan como entradas hacia un núcleo y se ensamblan en una plataforma. Hace visible el problema de información fragmentada. | Media; riesgo acotado a cinco módulos y cuatro conexiones. |
| Recorrido de una solicitud | Un registro recorre captura, validación y operación. Explica el proceso con una coreografía centrada en un dato. | Media; bajo coste gráfico, pero necesita reorganizar más la narración existente. |

Se recomendó Mesa de integración primero y Arquitectura desplegada como posible intervención posterior. Sólo se implementó la primera.

## Implementación

- A: cuatro sistemas separados, inclinados, cada uno con una capa de registros propia; conjunto con perspectiva de 22 grados.
- B: los registros se incorporan a los módulos, el plano se endereza y tres entradas convergen en el núcleo; se dibujan las conexiones y circulan pulsos.
- C: los módulos se redistribuyen alrededor del núcleo; una base y una superficie común se ensamblan desde abajo, con comprobaciones y resultado final.
- La misma timeline se puede recorrer en ambos sentidos. No hay bucles decorativos nuevos, scroll artificial, pin de GSAP ni aumento de longitud de la sección.
- Desktop desde 1001 × 600: sticky CSS a 104 px y canvas adaptable de 300–480 px. A 1280 × 600, el panel medido ocupa y=104–588, completamente visible una vez fijado.
- Tablet, móvil y alturas menores de 600: escenas inline dentro del scroll normal. No se fuerza la experiencia sticky.
- Se mantienen textos comerciales, enlaces, descripciones accesibles y el control de movimiento. Al desactivarlo, GSAP revierte sus estilos y se muestran las tres composiciones estáticas completas.
- Transform y opacity se usan para capas y módulos. La geometría y los trazos SVG requieren repintado: no se afirma que toda la animación se componga exclusivamente en GPU ni que se hayan medido 60 fps.

## Archivos de implementación

- `src/app/features/home/solutions/solutions.motion.ts`: coreografía, capas, registros y breakpoint.
- `src/app/features/home/solutions/solutions.motion.spec.ts`: estados A/B/C y reversibilidad.
- `src/app/features/home/solutions/solutions.css`: offset sticky.
- `src/app/features/home/solutions/story-visual/story-visual.html`: capas semánticamente decorativas.
- `src/app/features/home/solutions/story-visual/story-visual.css`: perspectiva, base y dimensiones adaptables.
- `src/app/features/home/solutions/story-visual/system-layout.ts`: posiciones compartidas por SVG y módulos.
- `src/app/features/home/solutions/story-visual/system-modules.css`: registros, profundidad y ajustes compactos.

## Validaciones

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 32 tests, 10 archivos, aprobados. El primer intento tuvo EPERM en temporales del sandbox; la ejecución fuera del aislamiento pasó. |
| `npm run build` | Aprobado; 5 rutas prerenderizadas; budgets sin advertencias. |
| Postbuild / artefacto de función | GET 200, POST 503 sin configuración y DELETE 405 esperados. Sin envíos ni cambios de configuración. |
| `npm run check:build` | Aprobado: 5 rutas, 115 enlaces, metadatos y fallback. |
| `npm run test:server` | 14 tests aprobados. |
| `npm run check:server` | Aprobado. |
| Prettier de los 7 archivos modificados | Aprobado. |
| `npm run format:check` global | No pasa: 28 archivos preexistentes sin formato, ajenos a los cambios. No se reformatearon. |
| `git diff --check` | Sin errores de espacios. |
| Browser | 390 × 844, 768 × 1024, 1366 × 768, 1280 × 600, 1280 × 540 y 1440 × 900. |
| Scroll | Recorrido hacia abajo y regreso al estado A comprobados en navegador y en el test de timeline. |
| Teclado | Enter en enlaces de etapa lleva el foco a la sección; Space en el switch restaura/reactiva movimiento. |
| Movimiento reducido | Fallback comprobado mediante switch en navegador. Cambios de `prefers-reduced-motion` y limpieza de listener cubiertos por test con matchMedia simulado; no se cambió la preferencia del sistema operativo. |
| Consola optimizada | Sin errores ni advertencias en la vista comprobada del build en 4202. El tab de desarrollo conservaba errores de HMR tras interrumpirse la sesión anterior. |

Los puertos usados fueron 4201 para desarrollo, 4202 para el build de revisión y 4204 para una copia aislada del código base. El proceso en 4200 no se tocó.

## Rendimiento: resultado y límite pendiente

Lighthouse 13.5.0, perfil móvil, build optimizado servido localmente, una medición por versión bajo las mismas opciones:

| Versión | Performance | Accesibilidad | CLS | LCP | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| Base main 983cda3, copia aislada | 46 | 100 | 0,405 | 5,79 s | 136 ms |
| Iteración 8 | 48 | 100 | 0,405 | 5,54 s | 143 ms |

Ambas mediciones atribuyen el mismo salto al footer durante la carga de fuentes. No hay evidencia de un nuevo CLS causado por esta intervención, pero **no se cumple CLS 0 en esta auditoría local**. La comparación de una sola ejecución no demuestra una mejora de rendimiento; pequeñas diferencias pueden ser ruido. La referencia anterior de Production (92 / CLS 0) no se reprodujo en este entorno. Antes de publicar, investigar la carga inicial/hidratación y repetir en un Preview equivalente a Production. No se alteró ese comportamiento global dentro de esta intervención visual.

Informes completos: [iteración](qa/iteration-8/lighthouse-mobile.report.html), [base](qa/iteration-8/lighthouse-baseline.report.html). Los JSON adyacentes conservan métricas, condiciones y hallazgos. No se midieron frame times ni dispositivos físicos; las capturas prueban composiciones, no fluidez por sí solas.

## Capturas para revisión

- [A — Fragmentación](qa/iteration-8/notebook-a.png)
- [B — Integración](qa/iteration-8/notebook-b.png)
- [C — Plataforma ensamblada](qa/iteration-8/notebook-c.png)
- [Desktop 1440](qa/iteration-8/desktop-1440.png)
- [Notebook 600 px](qa/iteration-8/notebook-600.png)
- [Altura 540 px, inline](qa/iteration-8/notebook-540.png)
- [Móvil 390 px](qa/iteration-8/mobile-390.png)
- [Tablet 768 px](qa/iteration-8/tablet-768.png)
- [Movimiento reducido y foco de teclado](qa/iteration-8/reduced-motion.png)

## Referencias estudiadas

Se leyeron los cinco SKILL.md solicitados del [repositorio web-animation-skills](https://github.com/iart-ai/web-animation-skills), adaptando sus principios a Angular:

- [gsap-web](https://github.com/iart-ai/web-animation-skills/tree/main/skills/gsap-web): timelines coordinadas y limpieza del ciclo de vida.
- [svg-animation](https://github.com/iart-ai/web-animation-skills/tree/main/skills/svg-animation): trazos y geometría compatibles entre estados.
- [60fps-animation](https://github.com/iart-ai/web-animation-skills/tree/main/skills/60fps-animation): priorizar transform/opacity y acotar capas.
- [accessible-animation](https://github.com/iart-ai/web-animation-skills/tree/main/skills/accessible-animation): alternativa estática, control de movimiento y contenido accesible.
- [micro-interaction](https://github.com/iart-ai/web-animation-skills/tree/main/skills/micro-interaction): feedback vinculado al estado del sistema; no se añadieron microinteracciones secundarias.

No se instalaron librerías de aplicación ni se ejecutaron scripts del repositorio de referencia. Lighthouse se utilizó como herramienta de auditoría desde la caché de npm.

Pendientes: aprobación visual de esta experiencia, diagnóstico del CLS inicial reproducido en la base y medición posterior en entorno de despliegue. No se avanzó a otra experiencia ni se publicó.
