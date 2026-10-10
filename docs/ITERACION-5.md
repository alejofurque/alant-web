# Iteración 5 — Web corporativa B2B

Validación final: **10 de octubre de 2026**. Implementación lista para revisión comercial y técnica local. No se publicó el sitio ni se modificó el dominio.

## Resultado y alcance

La web tiene Inicio, Servicios, Estudio y Contacto, con cabecera y pie compartidos. Se mantuvieron Precision Mint, Geist, los tokens visuales, el contenido principal de la homepage y sus experiencias de movimiento. No se añadieron animaciones secundarias ni casos ficticios.

| Ruta                        | Resultado                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | Homepage existente; navegación y CTAs conectados con las páginas interiores y email confirmado.                                                                                    |
| `/servicios`                | Software Engineering, Systems Integration y AI & Automation. Cada capacidad explica el problema, la propuesta, aplicaciones ilustrativas, beneficios buscados y un CTA contextual. |
| `/estudio`                  | Posicionamiento boutique, filosofía de ingeniería, principios, proceso de trabajo y evolución del software, sin datos de equipo ni trayectoria inventados.                         |
| `/contacto`                 | Email confirmado, guía descargable y formulario preparado pero deshabilitado hasta disponer de envío real probado.                                                                 |
| `/404` y rutas desconocidas | Página de error propia, enlaces de recuperación y `noindex`. El servidor de preview devuelve HTTP 404 para rutas inexistentes.                                                     |

No hay página ni enlaces de navegación a Proyectos. La homepage conserva los espacios de material pendiente ya aprobados, claramente identificados y sin demos, tecnologías o trabajos inventados.

## Componentes reutilizados y arquitectura

- Header y Footer pasan al shell de la aplicación. Se reutilizan los tokens, fuentes, flechas, botones y estados de foco existentes.
- Estudio reutiliza el componente de proceso de la homepage. Los diagramas y el sistema de movimiento existentes se conservan.
- `PageIntro` concentra la introducción editorial de las páginas interiores; `ConsultationCta` comparte su cierre comercial.
- Las páginas interiores son standalone con carga diferida. Angular Forms **21.2.25**, compatible con el core instalado, es la única dependencia añadida.
- `PageSeo` centraliza los metadatos por ruta. `publication.json` concentra el origen y la autorización de indexación, compartidos por la aplicación y el postbuild.
- El formulario reactivo tipado delega la entrega en `ContactGateway`. El componente no conoce proveedores ni credenciales.

## Funcionalidades operativas

La navegación entre páginas, menú móvil, enlaces de sección, footer y CTA global funcionan. El menú se cierra al navegar; Escape devuelve el foco al botón. El salto al contenido conserva la ruta actual y los cambios de página llevan el foco al contenido principal. La página activa se identifica visualmente y mediante `aria-current`.

Los CTAs de Servicios llevan a Contacto con el tipo de consulta preseleccionado. Se admite únicamente una lista conocida de opciones. El email real **alantdeveloper@gmail.com** está disponible como enlace `mailto:`; su apertura depende del cliente de correo configurado en el dispositivo. La guía `consulta-alant.txt` tiene un destino local real.

El formulario incluye nombre, email, empresa opcional, tipo y mensaje; errores asociados a los campos, foco en el primer error, estados accesibles de envío/recepción/error, prevención de doble envío, honeypot, cancelación y timeout. Permanece deshabilitado tanto prerenderizado como después de hidratar. La lógica también impide enviar mientras falte una configuración verificada. No se simuló ningún envío exitoso en el sitio.

Cada página tiene título, descripción y Open Graph propios en SSG y al navegar. Se extraen **313 mensajes** de i18n en español. No se publicó una versión inglesa incompleta.

## Archivos creados o modificados

Rutas relativas a la raíz del repositorio:

| Área                           | Archivos                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell y rutas                  | `src/app/app.ts`, `app.html`, `app.config.ts`, `app.routes.ts`, `app.routes.server.ts`; `src/app/features/home/home.ts`                              |
| Navegación                     | `src/app/shared/header/header.ts`, `header.html`, `header.css`, `header.spec.ts`; `src/app/shared/footer/footer.ts`, `footer.html`                   |
| Componentes compartidos nuevos | `src/app/shared/page-intro/page-intro.ts`, `page-intro.css`; `src/app/shared/consultation-cta/consultation-cta.ts`                                   |
| Servicios                      | `src/app/features/services/services-page.ts`, `services-page.html`, `services-page.css`, `services.data.ts`                                          |
| Estudio                        | `src/app/features/studio/studio-page.ts`, `studio-page.html`, `studio-page.css`                                                                      |
| Contacto                       | `src/app/features/contact/contact-page.ts`, `.html`, `.css`; `contact-form.ts`, `.html`, `.css`, `.spec.ts`; `contact-gateway.ts`, `.spec.ts`        |
| SEO y configuración            | `src/app/core/page-seo.ts`, `page-seo.spec.ts`, `publication.json`, `site.config.ts`; `src/app/features/not-found/not-found.ts`                      |
| Enlaces de homepage            | Componentes y plantillas `hero`, `services`, `projects`, `solutions`; pruebas `home.spec.ts`, `solutions.spec.ts`                                    |
| Tooling e idioma               | `package.json`, `package-lock.json`, `tsconfig.json`, `src/locale/messages.xlf`; `scripts/prepare-publication.mjs`, `check-build.mjs`, `preview.mjs` |
| Documentación y evidencia      | `README.md`, `docs/CONTACTO-INTEGRACION.md`, este informe y `docs/qa/iteration-5/`                                                                   |

Los archivos de animación GSAP, los estilos de los diagramas y los datos de sus etapas no se modificaron en esta iteración.

## Validación ejecutada

En este equipo se usa `scripts/npm.ps1` porque el launcher global de npm apunta a una instalación ausente. El bloqueo temporal del servicio de aprobación se resolvió y los comandos finales pudieron ejecutarse.

| Comando o comprobación               | Resultado                                                                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.\scripts\npm.ps1 run build`        | Correcto, sin advertencias de presupuesto; **5 rutas prerenderizadas**. Postbuild genera `404.html` y aplica la política de publicación.                          |
| `.\scripts\npm.ps1 test`             | **28 pruebas en 10 archivos**, todas correctas.                                                                                                                   |
| `.\scripts\npm.ps1 run check:build`  | **111 enlaces locales** revisados, IDs y destinos, metadatos únicos, estructura semántica, configuración de contacto y fallback estático de movimiento correctos. |
| `.\scripts\npm.ps1 run i18n:extract` | Correcto: **313 mensajes**.                                                                                                                                       |
| `.\scripts\npm.ps1 run format:check` | Correcto para código y configuración incluidos en el comando.                                                                                                     |
| Instalación de Angular Forms         | Versiones compatibles; auditoría de instalación sin vulnerabilidades reportadas.                                                                                  |
| HTTP local                           | `/`, `/servicios`, `/estudio`, `/contacto`: 200. `/ruta-inexistente` y `/proyectos`: 404.                                                                         |

Las pruebas incluyen validación de formularios, bloqueo sin proveedor, opciones permitidas, accesibilidad de errores, doble envío, conservación de datos ante error, recibo de recepción requerido, honeypot y cancelación. También cubren SEO durante navegación, canonical sin parámetros y retirada en 404, enlaces, preferencias de movimiento y regresión de la transformación existente. Los dobles de prueba del formulario no equivalen a una integración de correo real.

El bundle inicial final es de **317,64 kB**, con transferencia estimada de **90,32 kB**. Home: 74,84 kB; Contacto: 54,90 kB; Servicios: 16,52 kB; Estudio: 10,06 kB. Las páginas interiores se cargan de forma diferida; GSAP y ScrollTrigger conservan su carga diferida. No se relajaron los presupuestos para obtener el build.

### Navegador y revisión visual

Se revisó el build de producción en el navegador integrado de Codex:

- Servicios, Estudio y Contacto en **390, 768 y 1440 px**: composición legible y sin desbordamiento horizontal observado. Se ajustó el formulario para usar una columna cuando su contenedor es estrecho, con comprobación adicional en 1024 px.
- Menú móvil mediante Enter; cierre mediante Escape y restauración del foco; navegación con el menú abierto; salto al contenido y foco visible.
- CTA contextual de Servicios hacia Contacto, selección de tipo, email real, controles deshabilitados y mensaje transparente sobre el canal pendiente.
- Página 404 visible en una URL inexistente y recuperación a Servicios.
- Regreso de Estudio a Inicio: el hero llega a su estado completo; transformación espacial A → B → C y regreso a A. Se capturaron las tres etapas y el resultado final del sistema unificado.
- Inspección de consola al cerrar la revisión: sin errores ni advertencias capturados.
- Comprobación de contraste calculado sobre fragmentos de texto visibles de Servicios, Contacto y Estudio: sin fallos AA detectados en la muestra. Los ratios mínimos fueron aproximadamente 4,67:1, 4,72:1 y 4,80:1 respectivamente, excluyendo controles deshabilitados. Esta comprobación no constituye una auditoría WCAG completa.

Mediciones y comprobaciones manuales: [verification.json](qa/iteration-5/verification.json).

Capturas de las páginas:

- [Servicios desktop](qa/iteration-5/servicios-1440.png), [detalle](qa/iteration-5/servicios-detalle-1440.png), [tablet](qa/iteration-5/servicios-768.png), [móvil](qa/iteration-5/servicios-390.png).
- [Estudio desktop](qa/iteration-5/estudio-1440.png), [filosofía](qa/iteration-5/estudio-filosofia-1440.png), [tablet](qa/iteration-5/estudio-768.png), [móvil](qa/iteration-5/estudio-390.png).
- [Contacto desktop](qa/iteration-5/contacto-1440.png), [tablet](qa/iteration-5/contacto-768.png), [móvil](qa/iteration-5/contacto-390.png), [formulario móvil](qa/iteration-5/contacto-formulario-390.png).
- [404](qa/iteration-5/404-1440.png), [hero completo](qa/iteration-5/home-regresion-1440.png), transformación [A](qa/iteration-5/soluciones-A-regresion-1440.png), [B](qa/iteration-5/soluciones-B-regresion-1440.png) y [C](qa/iteration-5/soluciones-C-regresion-1440.png).

No se ejecutaron Lighthouse ni axe, ni una auditoría con lector de pantalla. No se probaron dispositivos físicos, otros motores de navegador, entrega real de correos o infraestructura de hosting. Las dimensiones indicadas corresponden a viewports de prueba. `prefers-reduced-motion` se conserva y tiene cobertura automatizada; no se cambió la preferencia del sistema operativo durante esta revisión.

## Información y configuración pendientes

1. **Proveedor y backend de contacto.** Elegir proveedor e implementar `/api/...` con validación de servidor, límites de frecuencia y tamaño, control de origen, honeypot y manejo de errores. Verificar recepción real en el buzón confirmado antes de activar `deliveryVerified`. El contrato y los pasos están en [CONTACTO-INTEGRACION.md](CONTACTO-INTEGRACION.md).
2. **Datos de privacidad.** Confirmar identidad responsable y tratamiento de datos real antes de habilitar la recopilación mediante formulario. No se inventó una política.
3. **Origen HTTPS de producción.** `src/app/core/publication.json` mantiene `origin: null` e `indexable: false`: metadatos `noindex`, robots bloqueado, sin canonical ni sitemap ficticios. Al confirmar origen y autorizar indexación, el postbuild puede generar sitemap de las cuatro páginas corporativas y robots coherente. La 404 siempre queda excluida.
4. **Hosting.** Al desplegar en una fase autorizada, configurar rutas estáticas, cabeceras y entrega de `404.html` con HTTP 404. Revisar indexación, enlaces y entrega de formularios en ese entorno.
5. **Contenido comercial y assets reales.** Revisar los textos; aportar proyectos autorizados con problema, solución, tecnologías, captura/video y enlace real para sustituir los espacios reservados de la homepage. Logo final e imagen social pueden incorporarse cuando estén aprobados. No bloquean esta revisión local.

El canal por email queda disponible. El formulario y la publicación permanecen pendientes de las integraciones y confirmaciones anteriores.
