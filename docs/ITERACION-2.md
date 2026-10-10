# ALANT — Iteración 2: refinamiento de homepage

Fecha: 8 de octubre de 2026. Alcance: homepage existente. Se leyeron completos `AGENTS.md`, el brief y el plan; se revisaron la referencia visual y el código antes de editar. No se añadieron dependencias, páginas internas, hosting ni cambios de dominio.

## 1. Cambios realizados

Se conservaron la paleta Precision Mint, Geist Sans/Mono, el wordmark provisional, la composición del hero y su diagrama original. El trabajo se mantuvo dentro de la arquitectura Angular standalone existente, con TypeScript estricto y Tailwind v4.

- **Legibilidad y jerarquía:** microtextos desde 11 px, mejores espacios y áreas de interacción de enlaces; etiquetas y estados de foco consistentes. Las capacidades usan un layout flexible para alinear descripciones y etiquetas. Se quitaron flechas decorativas que podían sugerir enlaces inexistentes.
- **Hero responsive:** mantiene el flujo CRM/ERP → núcleo → operación. Cuando el contenedor es estrecho, los mismos módulos se organizan en filas con conexiones propias, sin reducir las etiquetas a tamaños diminutos. No se incorporó una imagen de la referencia como fondo.
- **Soluciones concretas:** integración ecommerce/ERP/operación; pedidos y tareas administrativas con revisión humana; herramienta interna para solicitudes, responsables y estados. Cada ejemplo separa la situación del posible abordaje y conserva la aclaración de que no es un caso de cliente. Incluye un CTA contextual al contacto.
- **Proyectos y demostraciones:** nueva sección entre soluciones y estudio. Dos espacios explícitamente reservados, sin clientes, resultados, medios, tecnologías ni enlaces ficticios. Las fichas muestran el lugar de la captura/video, nombre, problema, solución y tecnologías; los campos pendientes se identifican como tales.
- **Componente reutilizable:** `ProjectCard` acepta un modelo discriminado de placeholder, demo o caso. Los placeholders no admiten un enlace ni un medio publicado. Para contenido real, admite imagen con texto alternativo y dimensiones, video con poster/controles/descripción/subtítulos y enlace opcional. Las imágenes usan carga diferida y el video no descarga ni reproduce automáticamente.
- **Navegación y conversión:** Proyectos se incorporó a header, menú y footer. El menú se adapta también a tablet. Todos los CTAs comerciales llegan a `#contacto`; la acción final dice exactamente qué hace: **Descargar guía del proyecto**. El fallback aclara que no envía información.
- **Accesibilidad de pestañas:** selección y foco con flechas, Home y End; orientación ARIA acorde al layout horizontal o vertical; panel identificado y accesible por teclado. El observador responsive se inicializa después del render y se limpia al destruir el componente, preservando el prerender.
- **Idioma:** los textos nuevos y modificados están en el catálogo español con IDs estables. Se extrajeron 154 mensajes. No se activaron rutas ni textos ingleses incompletos.

## 2. Archivos modificados

Archivos existentes:

| Área                             | Archivos                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tokens y estados compartidos     | `src/styles.css`                                                                                                         |
| Navegación                       | `src/app/shared/header/header.html`, `header.css`; `src/app/shared/footer/footer.html`, `footer.css`                     |
| Hero y diagrama                  | `src/app/features/home/hero/hero.css`; `src/app/features/home/system-diagram/system-diagram.css`                         |
| Capacidades                      | `src/app/features/home/services/services.html`, `services.css`                                                           |
| Soluciones                       | `src/app/features/home/solutions/solutions.ts`, `solutions.html`, `solutions.css`, `solutions.spec.ts`                   |
| Estudio y contacto               | `src/app/features/home/process/process.html`, `process.css`; `src/app/features/home/contact/contact.html`, `contact.css` |
| Composición y prueba de homepage | `src/app/features/home/home.ts`, `home.spec.ts`                                                                          |
| Traducción y validación          | `src/locale/messages.xlf`; `scripts/check-build.mjs`                                                                     |
| Documentación actual             | `README.md`                                                                                                              |

Archivos nuevos:

- `src/app/features/home/projects/projects.ts`, `projects.html`, `projects.css`.
- `src/app/shared/project-card/project-card.ts`, `project-card.html`, `project-card.css`, `project-card.model.ts`, `project-card.spec.ts`.
- `docs/ITERACION-2.md` y evidencia en `docs/qa/iteration-2/`.

La configuración de contacto continúa pendiente en `src/app/core/site.config.ts`. No se modificaron el lockfile ni las versiones de herramientas.

## 3. Validaciones ejecutadas

Se usó el wrapper `scripts/npm.ps1` por el launcher npm del equipo. Los comandos equivalentes son:

```powershell
npm run build
npm run check:build
npm test
npm run i18n:extract
npm run format:check
```

| Comprobación             | Resultado                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build de producción      | Correcto, sin advertencias; una ruta prerenderizada: `/`                                                                                                |
| HTML estático            | Español, H1 único, contenido presente sin JS, description y Open Graph únicos, anclas válidas y archivo descargable existente                           |
| Honestidad de la galería | Dos placeholders identificados; ningún medio ni enlace de demo/caso publicado                                                                           |
| Pruebas Vitest           | 4 archivos, 6 pruebas aprobadas: homepage/contacto, menú, pestañas y tres variantes de la ficha                                                         |
| Catálogo i18n            | Extracción correcta de 154 mensajes                                                                                                                     |
| Formato                  | Todos los archivos incluidos pasan Prettier                                                                                                             |
| Responsive               | Revisión visual en Chromium integrado a 390 × 844, 768 × 1024 y 1440 × 1000 px                                                                          |
| Desbordamiento           | Anchos del documento de 375, 753 y 1425 px respectivamente; sin elementos de contenido fuera del viewport. Diferencia de 15 px por la barra de scroll   |
| Teclado                  | Menú con Enter; Escape devuelve foco; navegación a Proyectos; flechas arriba/abajo, Home/End y Tab al panel; salto al contenido enfoca `main#contenido` |
| Foco                     | Contorno visible de 3 px en pestañas/panel y estilos coherentes en enlaces/botones                                                                      |
| Contraste de texto       | 124 fragmentos en mobile y 138 en desktop; ninguno bajo 4.5:1 para texto normal o 3:1 para texto grande; mínimo calculado 4.79:1                        |
| Tipografía y consola     | Fuentes locales cargadas, mínimo de texto visible 11 px; sin errores ni advertencias de la aplicación durante la revisión                               |

El build informa **285.63 kB iniciales** y **66.41 kB** del chunk de homepage. La transferencia JS/CSS estimada por Angular suma aproximadamente **97.2 kB**, aparte del HTML y las fuentes locales (141,020 bytes combinados). La galería placeholder no solicita imágenes ni videos. Se conservaron la precarga de Geist Sans, `font-display: swap` y las reglas de movimiento reducido.

Estos valores no son Core Web Vitals ni una medición de red de producción. El contraste se calculó a partir de los colores CSS y tamaños de texto renderizados; no constituye una auditoría completa WCAG. Las pruebas de medios verifican el componente con fixtures y no publican esos datos.

### Evidencia visual

- [Hero desktop, 1440 px](qa/iteration-2/hero-1440.png).
- [Capacidades desktop](qa/iteration-2/services-1440.png) y [capacidades tablet](qa/iteration-2/services-768.png), con títulos y separadores alineados.
- [Soluciones desktop](qa/iteration-2/solutions-1440.png).
- [Soluciones tablet](qa/iteration-2/solutions-768.png).
- [Proyectos desktop](qa/iteration-2/projects-1440.png), capturado con viewport de 1440 × 1500 para mostrar toda la composición.
- [Hero tablet, 768 px](qa/iteration-2/hero-768.png) y [proyectos tablet](qa/iteration-2/projects-768.png).
- [Hero mobile, 390 px](qa/iteration-2/hero-390.png), [proyectos mobile](qa/iteration-2/projects-390.png), [detalle de ficha](qa/iteration-2/project-card-390.png) y [contacto mobile](qa/iteration-2/contact-390.png).
- [Registro de layout y contraste](qa/iteration-2/verification.json).

Se guardaron capturas por sección. El navegador no permitió exportar toda la página de una sola vez en esta sesión.

## 4. Problemas pendientes y límites

El **contacto oficial sin confirmar** es la dependencia principal para la conversión: la guía ayuda a preparar la consulta, pero todavía no permite enviarla. El fallback es funcional y transparente.

El portfolio permanece vacío hasta disponer de material verificable. No se probaron reproducción de videos reales, calidad de capturas ni destinos externos, porque esos assets y enlaces aún no existen en el proyecto.

No se ejecutaron Lighthouse/axe, pruebas con lectores de pantalla, Safari/Firefox ni dispositivos físicos. No se cambió la preferencia de movimiento del sistema del usuario; se revisó la regla CSS existente. No se añadieron paquetes para esas auditorías.

El sitio sigue siendo una versión local de revisión con `noindex, nofollow` y `robots.txt` bloqueado. Canonical, URLs públicas, sitemap y activación de indexación dependen de una futura publicación autorizada. No hay errores conocidos de build ni problemas de overflow en los tamaños revisados.

## 5. Información y assets necesarios

1. **Contacto oficial:** email confirmado o URL real de calendario/contacto. El email se conecta en `siteConfig.contact.email`; un calendario requerirá adaptar esa configuración.
2. **Cada proyecto o demo:** nombre, categoría y confirmación de si es un trabajo documentado o una demostración técnica. Problema, alcance realmente construido, decisiones relevantes y tecnologías efectivamente utilizadas.
3. **Medios autorizados:** captura con texto alternativo y dimensiones o video optimizado con poster, descripción y subtítulos si tiene audio. Retirar datos sensibles de pantallas antes de incorporarlas.
4. **Destinos reales:** URL de demo o caso cuando exista. Una ficha puede publicarse sin enlace; no necesita un destino simulado.
5. **Permisos y marca:** autorización para mostrar el material y nombres de clientes, si corresponde; wordmark definitivo cuando esté aprobado. El actual sigue siendo temporal.

Para incorporar material, actualizar los datos tipados de `projects.ts` con estado `demo` o `case`, completar los campos y asociar el medio real. Mantener `$localize` para contenido estático y añadir traducciones completas sólo cuando se habilite inglés. Volver a comprobar responsive, accesibilidad y presupuesto de assets con ese contenido.

La iteración se detiene en la homepage para revisión del diseño.
