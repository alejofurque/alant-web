# Blueprint integrado en la homepage

Integración cerrada el 26 de octubre de 2026, después de la elección de Blueprint to Product. Preview local: <http://127.0.0.1:4202/#soluciones>.

## Resultado

- Una escena a ancho completo reemplaza los diagramas laterales de «Cuando las piezas trabajan juntas». El hero no cambia.
- Arquitectura de pedido, reglas y operación → construcción de interfaz → herramienta de gestión. HTML/CSS/SVG propios, sin imágenes, servicios ni paquetes nuevos.
- Reproducción única al entrar en pantalla (6,8 s), repetición, pausa y continuación. Controles encima de la escena, sin pinning ni scroll obligatorio para completar la secuencia.
- Se conservan las tres situaciones comerciales, sus textos, enlaces internos y CTA. Ahora se presentan debajo de la escena, en tres columnas en escritorio y una en tamaños menores.
- El HTML prerenderizado muestra el producto final. Sin JavaScript, con movimiento reducido o si GSAP no carga, el contenido sigue visible. El control global de animaciones restaura esa vista estática.
- GSAP se carga con el runtime compartido existente. El componente libera contextos, media queries y observación al destruirse o cambiar la preferencia. La adaptación responsive conserva el progreso al cruzar el breakpoint.
- El gráfico está identificado como representación conceptual; sus controles internos son ilustraciones, no elementos interactivos. El texto visual está marcado para Angular i18n y dispone de una descripción accesible.

## Archivos

Nuevos: `src/app/features/home/solutions/blueprint/blueprint.ts`, `.html`, `.css`, `blueprint.scene.css`, `blueprint.timeline.ts`, `blueprint.timeline.spec.ts`.

Modificados: `solutions.ts`, `solutions.html`, `solutions.css`, `solutions.spec.ts` y `scripts/check-build.mjs` para comprobar el nuevo fallback prerenderizado. Los componentes anteriores quedan conservados en el repositorio, pero ya no se importan desde la sección y no forman parte de su bundle.

Se conservan los cambios anteriores del laboratorio y la corrección de hidratación i18n; el laboratorio de tres conceptos continúa separado. No se modificaron contacto, variables, DNS ni configuración de producción. No hay commit, push ni despliegue de esta integración.

## Validaciones

- Build Angular de producción: correcto, 5 rutas prerenderizadas. Bundle inicial 319,54 kB / transferencia estimada 90,80 kB; CSS 8,15 kB. Sin aumento frente al build corregido anterior (319,58 kB).
- 33 tests aprobados en 11 archivos. Incluyen fallback sin motor de animación, preservación de enlaces/copy y una prueba de repetición/restauración de estilos del timeline Blueprint.
- Check de build: 5 rutas, 116 enlaces locales, metadatos e hidratación, privacidad del destinatario y representación estática de Blueprint correctos.
- Check de función local: GET 200, POST 503 controlado y DELETE 405. Ningún envío real ni modificación del backend.
- Prettier de los archivos de integración y `git diff --check`: correctos.
- Navegador: 1440, 768 y 390 px; repetición, pausa/continuación, teclado, menú responsive y cambio manual a movimiento reducido. Sin errores de consola observados ni overflow horizontal. Se comprobó que el contenido inferior entra dentro del panel y que el resultado final persiste al cambiar entre móvil y escritorio.
- Correcciones visuales durante QA: controles trasladados arriba; line-height acotado a la escena para evitar heredar alturas que recortaban el panel; ajuste del pie técnico móvil para que no se superponga a la interfaz.

Comandos:

```powershell
.\scripts\npm.ps1 run build
node node_modules/@angular/cli/bin/ng.js build alant-web
node scripts/prepare-publication.mjs
node scripts/check-build.mjs
.\scripts\npm.ps1 test
node scripts/check-function.mjs
git diff --check
```

La compilación inicial pasó, pero el postbuild de función y el primer intento de Vitest encontraron restricciones de loopback/archivos temporales de la sandbox. Las comprobaciones se repitieron con permisos de ejecución y pasaron. Los últimos builds incluyeron los ajustes CSS detectados en navegador.

## Lighthouse local final

26/10/2026, build optimizado servido en 127.0.0.1:4202. Lighthouse 13.5.0, Chrome headless, emulación móvil 412 × 823 / DPR 1,75, CPU ×4 y red simulada RTT 150 ms / 1.638,4 Kbps. Una ejecución de comprobación, no una muestra de usuarios reales. No hubo build simultáneo.

| Métrica | Resultado |
| --- | --- |
| Performance | 65 |
| CLS | 0,00004999 |
| LCP | 6,03 s |
| TBT | 60,5 ms |
| Accesibilidad automática | 100 |
| SEO local | 66 |

El único fallo SEO de esta auditoría es `is-crawlable`: el preview local mantiene `noindex` intencionalmente. No se cambió esa configuración ni se auditó el sitio de producción. La puntuación de accesibilidad no sustituye una auditoría manual completa.

CLS permanece debajo de 0,1 y el rendimiento coincide con la mediana anterior (65). **LCP ~6 s sigue pendiente**; no se presenta esta integración como una optimización de carga. No se probaron dispositivos físicos, Safari ni Firefox.

Evidencias: [escritorio](desktop-final.jpg), [móvil](mobile-final.jpg), [tablet](tablet.jpg), [movimiento reducido](desktop-reduced.jpg), [reporte Lighthouse](lighthouse.json.gz), [trace](lighthouse.trace.json.gz). Para inspeccionar el trace, descomprimir y cargar el JSON en DevTools → Performance → Load profile.

El servidor de preview usado es `node artifacts/iteration-8-preview.mjs` y sirve el build actual en 4202. Para desarrollo después de cerrar ese servidor puede usarse `node node_modules/@angular/cli/bin/ng.js serve alant-web --host 127.0.0.1 --port 4201`. El puerto 4200 no se utilizó ni se modificó.
