# Iteración 7 — Claridad comercial y visualización

Implementada el 11/10/2026 en la rama local `review/iteration-7-commercial-ux`. Sin push ni despliegue. Se conservaron los cambios pendientes de la auditoría anterior, incluidos los proyectos ocultos y canonical.

## Diagnóstico y decisiones

| Sección | Problema original | Cambio | Utilidad para el visitante |
| --- | --- | --- | --- |
| Hero | «Resolver desafíos reales» no identifica rápidamente la oferta | Subtítulo con software a medida, conexión y automatización | Entender qué se puede contratar al llegar |
| Capacidades | Nombres ingleses dominantes e íconos abstractos | Beneficio en español, interfaz conceptual y situación de contratación | Reconocer una necesidad propia sin dominar terminología técnica |
| Soluciones | La descripción de arquitectura eclipsaba el problema empresarial | Tres situaciones concretas y recorridos entrada → proceso → resultado | Relacionar la capacidad técnica con una operación cotidiana |
| Servicios | Oferta, capacidades y nueve ejemplos repetían ideas | Una oferta breve, alcance escaneable, visual y objetivo por servicio | Comparar opciones y pasar a una consulta contextual |
| Estudio/metodología | Párrafos abstractos y reiteración de principios | Atención directa, alcance, entregas, pruebas y mantenimiento | Entender qué esperar del trabajo conjunto |

Se conservaron titular, paleta, tipografías, alternancia de fondos, rutas, SEO y estructura i18n. No se añadieron librerías, imágenes externas, escenas 3D, proyectos ni métricas comerciales. Las interfaces son HTML/CSS, sin controles que aparenten funcionar como una demo.

## Textos y conversión

Hero: **«Desarrollamos software a medida, conectamos sistemas y automatizamos procesos para que tu empresa trabaje mejor.»** El titular «Software bien construido. Operaciones que avanzan.» permanece.

Las categorías Software Engineering, Systems Integration y AI & Automation se mantienen, con títulos orientados al cliente:

- «Una herramienta a tu medida.»
- «Tus sistemas, trabajando juntos.»
- «Menos tareas manuales. Más control.»

Las situaciones de Soluciones ahora muestran el pedido cargado en varias aplicaciones, las solicitudes transcritas a mano y el seguimiento disperso entre planillas. Se identifican como ejemplos posibles, sin atribuirlos a clientes.

El CTA comercial es «Hablemos de tu proyecto». Los enlaces secundarios llevan a la sección correspondiente de Servicios; sus CTAs abren Contacto con el tipo de proyecto seleccionado. La integración, las credenciales y los indicadores de contacto no se modificaron.

## Intervenciones visuales

1. **Capacidades y Servicios:** componente reutilizable `SolutionPreview` con tres variantes: gestión de pedidos y responsables; tienda online conectada al sistema de gestión mediante validación; documento con extracción y revisión humana. Cada figura dice «Interfaz conceptual» y tiene una descripción accesible. No contiene cifras, nombres de clientes ni resultados inventados.
2. **Soluciones:** recorridos compactos de información dentro de cada explicación, junto a la arquitectura animada existente. No añaden otra sección ni nuevas animaciones. Los módulos, posiciones y timelines originales se conservan.

En tablet las tarjetas de capacidades pasan a filas con texto y visual en paralelo; en móvil usan una columna. La revisión desktop detectó diferencias de altura entre visuales y se corrigieron para alinear el contenido.

El recuento orientativo del texto de `main` prerenderizado bajó aproximadamente **24% en Servicios y 22% en Estudio**. En Inicio subió 9% al incluir las etiquetas de las interfaces y los ejemplos concretos. No se aplicó un recorte automático. Este recuento por espacios incluye etiquetas y texto accesible, no equivale a palabras leídas por un visitante. Evidencia: `qa/iteration-7/editorial-comparison.json`.

La altura observada de Inicio en 1440 px pasó de 6509 a 6773 px (aproximadamente 4%); el incremento corresponde a las interfaces útiles, sin añadir secciones. No se afirma que toda la homepage tenga menos texto o longitud.

## Archivos de esta iteración

- Nuevos: `src/app/shared/solution-preview/solution-preview.ts`, `.html`, `.css`.
- Inicio: `src/app/features/home/hero/hero.html`; `services/services.ts`, `.html`, `.css`; `solutions/solutions.data.ts`, `.html`, `.css`, `.spec.ts`; `process/process.html`.
- Servicios: `src/app/features/services/services.data.ts`, `services-page.ts`, `.html`, `.css`. Se eliminaron datos y CSS de bloques que ya no se renderizan.
- Estudio: `src/app/features/studio/studio-page.html`.
- Validación/idioma: `scripts/check-build.mjs`, `src/locale/messages.xlf`.
- Documentación y capturas: `README.md`, este informe y `docs/qa/iteration-7/`.

Los cambios previos en `home.ts`, SEO/publication, auditoría de producción y configuración documental de contacto ya estaban pendientes al comenzar. No fueron revertidos ni presentados como cambios de esta iteración. No hay modificaciones en `api/`, `server/`, el formulario/gateway, configuración de contacto, paquetes ni código de motion.

## Validaciones

| Comando / revisión | Resultado |
| --- | --- |
| `.\scripts\npm.ps1 run build` | Correcto; 5 rutas prerenderizadas, sin advertencias de presupuesto |
| `.\scripts\npm.ps1 test` | 32 pruebas aprobadas en 10 archivos. Se actualizó una expectativa que contenía el texto anterior de Soluciones |
| `.\scripts\npm.ps1 run test:server` | 14 pruebas aprobadas, proveedores simulados |
| `.\scripts\npm.ps1 run check:server` | TypeScript del servidor correcto |
| `.\scripts\npm.ps1 run check:build` | 115 enlaces locales, canonical/metadatos, fallback y ausencia de correo privado correctos; 3 visuales conceptuales en cada página correspondiente |
| `.\scripts\npm.ps1 run i18n:extract` | 305 mensajes; sólo español fuente |
| `.\scripts\npm.ps1 run format:check` | Correcto |
| `git diff --check` | Correcto |
| Inicio / Servicios / Estudio | Revisados en navegador a 390, 768 y 1440 px, sin overflow horizontal observado |
| Navegación | Capacidad → sección de Servicios → Contacto con `tipo=software`; formulario sigue deshabilitado |
| Teclado | Menú con Enter, Escape, foco restaurado y contorno visible; navegación móvil cierra el menú |
| Animaciones | Hero/repetición; transformación espacial A/B/C registrada; alternativa estática completa al desactivar animaciones; sin sticky desktop en móvil |
| Contraste | Muestra de textos/composiciones de las tres páginas sin fallos AA detectados; ratios mínimos calculados entre 6,38 y 6,72 |
| Consola | Sin errores ni advertencias capturados al finalizar |

Bundle inicial: **317,14 kB**, transferencia estimada **90,10 kB**, frente a 317,22 / 90,18 kB en la auditoría anterior. Los nuevos visuales se comparten en un chunk diferido de 9,74 kB (2,58 kB estimados de transferencia). GSAP conserva carga diferida. Estos tamaños no son una medición de velocidad real.

No se ejecutaron Lighthouse, axe, auditoría con lector de pantalla, otros motores ni dispositivos físicos. `prefers-reduced-motion` conserva su cobertura automatizada; se probó el control de movimiento del sitio, sin cambiar la preferencia del sistema operativo. No se realizaron nuevos ensayos de envío ni auditoría remota del backend.

## Capturas

- Capacidades desktop: [antes](qa/iteration-7/before-capacidades-1440.jpg), [después](qa/iteration-7/after-capacidades-1440.jpg), [detalle completo](qa/iteration-7/capacidades-detalle-1440.jpg).
- Hero móvil: [antes](qa/iteration-7/before-hero-390.jpg), [después](qa/iteration-7/after-hero-390.jpg).
- Capacidades: [390 px](qa/iteration-7/capacidades-detalle-390.jpg), [768 px](qa/iteration-7/capacidades-768.jpg).
- Servicios: [390 px](qa/iteration-7/servicios-390.jpg), [768 px](qa/iteration-7/servicios-768.jpg), [1440 px](qa/iteration-7/servicios-1440.jpg), [automatización móvil](qa/iteration-7/automatizacion-390.jpg).
- Estudio: [390 px](qa/iteration-7/estudio-390.jpg), [768 px](qa/iteration-7/estudio-768.jpg), [1440 px](qa/iteration-7/estudio-1440.jpg).
- Soluciones: [A](qa/iteration-7/soluciones-A-1440.jpg), [B](qa/iteration-7/soluciones-B-1440.jpg), [C](qa/iteration-7/soluciones-C-1440.jpg), [móvil](qa/iteration-7/soluciones-390.jpg).

Datos de inspección: `qa/iteration-7/verification.json`. Las capturas corresponden al build local, no al sitio público.

## Pendientes y límites

La propuesta comunica antes lo que se puede contratar y vincula cada servicio a un problema y un visual. Esta conclusión procede de revisión editorial y visual; las pruebas de comprensión en 5/30/60 segundos necesitan visitantes reales y no se presentan como resultados medidos.

La habilitación comercial sigue dependiendo de completar la validación de contacto y privacidad descrita en `AUDITORIA-PRODUCCION.md`. No se revalidó el 500 remoto en esta iteración. La aprobación de diseño y textos, el eventual despliegue y la publicación de material real quedan pendientes. No se habilitó indexación ni se publicó una versión inglesa incompleta.
