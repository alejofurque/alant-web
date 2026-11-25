# Panorama A — integración estática

Fecha: 27 de octubre de 2026. La elección de A se integra en la homepage local. No se hizo commit, push ni despliegue.

## Alcance

- Hero con panel operativo, preparación de pedidos, integración ecommerce/ERP y extracción de documentos con revisión humana.
- Se conserva el header corporativo, menú móvil, footer, rutas, metadatos y contacto existentes.
- Datos ficticios y ejemplos conceptuales identificados. Sin proyectos ni resultados de clientes inventados.
- Componentes standalone y textos con marcadores Angular i18n. Sin nuevas dependencias.
- La homepage ya no monta Hero/Solutions/Blueprint anteriores ni importa GSAP. Sus fuentes se conservan junto con los trabajos previos; no se borran cambios pendientes.
- No se implementó la animación protagonista. Los prototipos A/B permanecen aislados para comparación.

## Archivos de esta integración

- `src/app/features/home/home.ts`, `home.html`, `home.spec.ts`.
- `src/app/features/home/home-base.css`, `home-hero.css`, `home-services.css`, `home-closing.css`.
- `src/app/features/home/product-scenes/`: tres componentes de interfaces, templates y estilos por escena (pedido, detalle, preparación, ERP y documento).
- `scripts/check-build.mjs`: se actualizan las expectativas de la homepage al nuevo diseño; se conservan las comprobaciones de rutas, privacidad, contacto y las previews de Servicios.
- Este informe y capturas.

Los estilos compartidos entre la composición y sus componentes ilustrativos están prefijados con `.alant-home`. No afectan otras rutas ni el header/footer. Los tokens principales utilizan las variables centrales existentes.

## Validación

| Comprobación | Resultado |
| --- | --- |
| `node node_modules/@angular/cli/bin/ng.js build alant-web` | Correcto, 5 rutas prerenderizadas, sin advertencias de presupuesto en el build final |
| `node node_modules/@angular/cli/bin/ng.js test alant-web --watch=false` | 33 tests aprobados / 11 archivos |
| `node scripts/prepare-publication.mjs` | Assets locales de publicación generados; no publica nada |
| `node scripts/check-build.mjs` | 5 rutas, 107 enlaces, metadatos, hidratación SSR, ausencia de destinatario privado y fallback del formulario |
| `node scripts/check-function.mjs` | Artefacto local: GET 200, POST 503 deshabilitado, DELETE 405; sin credenciales ni acceso externo |
| Prettier en archivos de esta integración | Correcto |
| `git diff --check` | Correcto; Git informa normalización LF/CRLF |

Vitest y la prueba del artefacto necesitaron ejecución fuera del aislamiento de Windows por EPERM en archivos temporales y EACCES en loopback, respectivamente; después pasaron. No hubo cambios de código para eludir esas comprobaciones.

Build final: inicial 317,21 kB (transferencia estimada 90,05 kB), chunk lazy de homepage 137,70 kB (11,17 kB estimados). Estos tamaños no son mediciones de rendimiento de usuario ni Lighthouse.

## Navegador

Build de producción servido exclusivamente en loopback, puerto 4302. El puerto 4200 no se tocó. El servidor local de revisión está en `artifacts/panorama-preview.mjs` (artefacto de QA, sin API de envío).

- 1440 × 1000, 768 × 1024 y 390 × 844. Sin overflow horizontal: scrollWidth = clientWidth en los tres tamaños.
- Menú móvil abre, cierra al elegir Soluciones y actualiza el fragmento.
- El enlace del hero llega a `/#servicios`, con el inicio de sección a 100 px del borde superior y el header por encima.
- CTA de software navega por Angular a `/contacto`; página y estilos existentes conservados. No se envió ningún formulario.
- Tab enfoca Saltar al contenido con outline visible; Enter lleva el foco a `main#contenido`.
- Sin errores ni advertencias de consola en la sesión inspeccionada.
- Capturas completas: [desktop](desktop.png), [tablet](tablet.png), [móvil](mobile.png). [Hero](hero.png).

No se modificaron backend, variables, configuración de contacto ni despliegue. El estado deshabilitado observado corresponde al preview local, no demuestra el estado de Production. No se midió CLS/Lighthouse, ni se realizó auditoría WCAG completa o prueba en dispositivo físico en esta integración.

## Próximo punto de revisión

Revisar la composición integrada. La animación del pedido en el hero y la publicación quedan pendientes de una instrucción posterior.
