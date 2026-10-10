# Iteración 4 — Living Architecture y transformación con scroll

Fecha: 9 de octubre de 2026. Alcance cerrado en los dos efectos solicitados; homepage lista para revisión visual del propietario.

## Diagnóstico y resultado

La animación anterior se apoyaba en entradas breves y variaciones de opacidad, con diagramas cuya geometría permanecía prácticamente estable. No mostraba una construcción espacial suficientemente evidente. Se conservó la composición Precision Mint y se cambiaron las dos experiencias protagonistas.

En «Cuando las piezas trabajan juntas», cinco elementos persistentes se reorganizan: cuatro sistemas dispersos, entradas alineadas alrededor de un núcleo y, finalmente, una plataforma compartida. Las conexiones se dibujan y cambian de recorrido junto con los módulos; los pulsos llegan al núcleo, salen hacia operación y completan el resultado visible. El scroll controla el avance y permite revertirlo.

El hero ensambla CRM, ERP, API/Core y Operación en una secuencia de aproximadamente cinco segundos. Las conexiones se trazan, los datos circulan, el núcleo responde y «En espera» cambia a «Datos conectados». Se reproduce una vez al entrar en pantalla; «Repetir» permite revisarlo voluntariamente. No hay un bucle automático.

## Comportamiento y arquitectura

- Escritorio desde 1001 px de ancho y 800 px de alto: un único diagrama sticky mediante CSS y ScrollTrigger con `scrub: 0.55`. El recorrido usa la altura natural de los tres artículos, sin bloquear el scroll ni añadir espaciadores de pinning.
- Pantallas compactas: gráficos dentro de cada artículo con transformación vinculada al scroll y `scrub: 0.35`. No hay panel fijado ni recorrido artificial adicional.
- Los estados estáticos y el contenido comercial están en el HTML prerenderizado. El motor se importa después del render del navegador y sólo si se permite movimiento. Los fallos de carga o inicialización restauran los estilos estáticos.
- `gsap.context`, `gsap.matchMedia`, `DestroyRef` y la limpieza de observadores revierten recursos al cambiar de tamaño, reducir movimiento o destruir el componente. La animación corre fuera de Angular; las etiquetas cambian al pasar de etapa, no en cada fotograma.
- El control «Animaciones» permite comparar con los estados estáticos; respeta la preferencia del sistema. No se agregaron efectos secundarios en esta iteración.
- Transformaciones de módulos mediante `transform`; conexiones SVG mediante trazos y atributos. Sin WebGL, canvas, partículas ni plugins de morphing adicionales.

Referencias técnicas consultadas: [GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context()/), [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) y [ciclo de vida Angular](https://angular.dev/guide/components/lifecycle).

## Archivos intervenidos

| Área | Archivos |
| --- | --- |
| Motor y preferencias | `src/app/core/motion/motion-runtime.ts`, `motion-preferences.ts` y sus dos archivos `.spec.ts` |
| Control accesible | `src/app/shared/motion-toggle/motion-toggle.ts`, `src/styles.css` |
| Hero y arquitectura viva | `src/app/features/home/hero/hero.ts`, `.html`, `.css`; `src/app/features/home/system-diagram/system-diagram.ts`, `.html`, `.css`, `.motion.ts`, `.motion.css` |
| Transformación | `src/app/features/home/solutions/solutions.ts`, `.html`, `.css`, `.data.ts`, `.motion.ts`, `.spec.ts`, `.motion.spec.ts` |
| Geometría y presentación | `src/app/features/home/solutions/story-visual/story-visual.ts`, `.html`, `.css`, `system-layout.ts`, `system-modules.css` |
| Dependencias e idioma | `package.json`, `package-lock.json`, `src/locale/messages.xlf` |
| Verificación y documentación | `scripts/check-build.mjs`, `scripts/preview.mjs`, `README.md`, este informe y `docs/qa/iteration-4/` |

La lista incluye la infraestructura de movimiento iniciada en la iteración anterior y reutilizada aquí. No hay repositorio Git inicializado en esta carpeta para producir un diff contra aquella versión.

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `.\scripts\npm.ps1 run build` | Correcto, sin advertencias. Una ruta prerenderizada: `/`. Presupuestos originales conservados. |
| `.\scripts\npm.ps1 test` | 15 pruebas correctas en siete archivos. |
| `.\scripts\npm.ps1 run check:build` | HTML español, metadatos, anclas, contacto descargable, tres etapas estáticas y ausencia de estilos de animación en SSG verificados. |
| `.\scripts\npm.ps1 run i18n:extract` | 156 mensajes extraídos. Sin ruta inglesa incompleta. |
| `.\scripts\npm.ps1 run format:check` | Correcto. |
| Auditoría durante instalación de GSAP | Cero vulnerabilidades reportadas en ese momento. |

Las pruebas cubren preferencias del sistema, limpieza, imports que terminan después de destruir el componente, fallos de carga/inicialización y restauración del contenido. Una prueba con GSAP real recorre A → B → C → A y verifica las posiciones y la identidad de los mismos nodos, incluyendo la regresión que inicialmente dejaba algunos módulos en la posición final por un stagger.

Build final: entrada inicial 289.19 kB (transferencia estimada 83.94 kB); homepage diferida 88.77 kB (19.84 kB); GSAP 70.51 kB (25.06 kB); ScrollTrigger 43.59 kB (16.41 kB). Total estimado de esos grupos: 145.25 kB transferidos, sin HTML ni fuentes. No son métricas de campo ni resultados Lighthouse.

## Verificación visual

Se revisó el build de producción en el navegador integrado y se guardaron capturas reales, sin forzar el progreso de GSAP mediante JavaScript.

- **1440 × 900:** transformación A/B/C y reversión al subir, anclas entre etapas y recarga dentro de una etapa. En un canvas de 606 px, algunos módulos cambian más de 300 px de posición horizontal. En C, el panel completo queda entre y=122 y y=787, dentro del viewport. Cinco nodos persistentes, sin sustituir diagramas completos mediante fades.
- **768 × 1024:** composición inline, módulos separados, núcleo y conexiones visibles. El cambio de tamaño desde escritorio elimina correctamente el modo sticky.
- **390 × 844:** plataforma final con cinco módulos sin superposición. Canvas de 325 × 406.25 px; ancho de documento 375 px con scrollbar y `scrollWidth` también 375 px. La captura y las medidas están guardadas en `mobile-verification.json`.
- **Movimiento reducido:** el switch funciona con teclado, mantiene foco visible y restaura los tres diagramas estáticos. Altura de página antes/después: 7939 px; altura del recorrido: 2286.3125 px; posición del recorrido: 2387.1875 px. Sin cambio de geometría en esa comparación concreta; no equivale a una medición formal de CLS.
- **Hero:** secuencia, pulsos, respuesta central, estado final y repetición manual observados. Capturas de cuatro momentos en escritorio. En 390 px, el diagrama se adapta verticalmente, termina en «Datos conectados» y no produce desbordamiento horizontal; consola sin errores ni advertencias en la comprobación final.

### Evidencia

| Experiencia | Capturas |
| --- | --- |
| Hero | [Ensamble](qa/iteration-4/hero-1440-ensamble.png), [conexiones](qa/iteration-4/hero-1440-conexiones.png), [validación](qa/iteration-4/hero-1440-validacion.png), [completo](qa/iteration-4/hero-1440-completo.png) |
| Transformación desktop | [A: fragmentación](qa/iteration-4/scroll-1440-A-fragmentacion.png), [B: integración](qa/iteration-4/scroll-1440-B-integracion.png), [C: unificado](qa/iteration-4/scroll-1440-C-unificado.png) |
| Responsive | [768 px](qa/iteration-4/scroll-768-integracion.png), [390 px](qa/iteration-4/scroll-390-unificado.png), [hero móvil](qa/iteration-4/hero-390-completo.png) |
| Alternativa estática | [Movimiento reducido](qa/iteration-4/movimiento-reducido-1440.png) |

No se grabó video: la evidencia corresponde a capturas de estados. No se ejecutaron Lighthouse, axe, pruebas con lector de pantalla, Safari/Firefox, dispositivos físicos ni un perfil de fotogramas. La preferencia del sistema se probó mediante tests; en navegador se comprobó el switch que activa la misma restauración. No se modificó la preferencia global del sistema operativo. El HTML sin motor se comprobó mediante la validación de SSG; el modo `--static-only` quedó disponible para revisión adicional, sin afirmar una prueba completa con JavaScript deshabilitado en navegador.

## Revisión y pendientes

Abrir `http://127.0.0.1:4200/`, observar el hero o pulsar «Repetir», y recorrer «Cuando las piezas trabajan juntas» hacia abajo y hacia arriba. Para ver el panel sticky, usar al menos 1001 × 800 px; las ventanas más bajas muestran la adaptación compacta. El switch «Animaciones» permite comparar ambas presentaciones.

Los únicos pendientes de producto heredados son confirmar el canal de contacto, incorporar proyectos/demos con material autorizado y definir los datos de publicación. No se inventaron clientes, métricas, casos ni enlaces. Se conserva `noindex, nofollow` durante revisión. No se publicaron cambios ni se modificó el dominio. Servicios, Proyectos, Estudio y Contacto como páginas independientes siguen fuera del alcance.
