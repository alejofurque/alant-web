# Creative Experience — revisión local

Fecha: 23 de octubre de 2026. Rama: `codex/creative-experience-lab`.

Actualización 26/10/2026: el usuario eligió Blueprint to Product y se completó su integración local. Este documento conserva la comparación previa; ver el [informe de integración](../blueprint-integration/README.md) para el estado actual de la homepage.

## Revisar los conceptos

Laboratorio local: <http://127.0.0.1:4300/>. Los tres conceptos comparten el título, propuesta de valor y CTA aprobados. La escena ocupa el ancho de la composición; no hay pinning ni recorrido de scroll obligatorio. Cada secuencia dura 6,8 segundos, se reproduce por decisión del usuario y dispone de pausa, selector de estados y control de progreso.

Para volver a abrirlo después de cerrar los servidores:

```powershell
node node_modules/@angular/cli/bin/ng.js serve creative-lab --host 127.0.0.1 --port 4300
```

El proyecto Angular `creative-lab` es independiente del build corporativo, sus rutas y su prerender. Sus enlaces de comparación y contacto apuntan al preview corporativo local del puerto 4202. El laboratorio tiene `noindex,nofollow`; no debe publicarse. No se usó ni modificó el puerto 4200.

| Concepto | Estado inicial → intermedio → final | Relación comercial | Coste estimado |
| --- | --- | --- | --- |
| Fragmented to Unified | Ventanas de pedidos, gestión y equipo dispersas → desplazamiento, alineación y conexiones → espacio compartido con responsables y próximos pasos | Integrar herramientas existentes y reducir cargas separadas | Bajo/medio: tres ventanas, transformaciones y trazado de dos paths SVG; sin imágenes ni vídeo descargado |
| Blueprint to Product | Arquitectura de pedido, validación y operación → convergencia del plano y construcción de interfaz → aplicación de gestión de pedidos | Convertir reglas y procesos en software a medida comprensible | Bajo/medio: transformaciones, trazado SVG y aparición escalonada de filas; perspectiva sólo en la transición |
| Engineered Depth | Capas de datos, reglas e interfaz → aproximación y alineación → producto ensamblado, plano y legible | Mostrar las responsabilidades técnicas detrás de una operación integrada | Medio: tres superficies CSS 3D con perspectiva, mayor superficie de composición y sombras estáticas |

Los costes son una estimación relativa de renderizado, no mediciones de FPS ni una garantía para equipos de gama baja. El laboratorio completo, incluyendo Angular, GSAP y los tres conceptos, pesa 236,75 kB iniciales / 73,63 kB de transferencia estimada por Angular. No es el coste incremental de integrar un concepto. No agrega paquetes, WebGL, partículas, autoplay permanente ni recursos externos.

**Recomendación: Blueprint to Product.** Produce el cambio composicional más fácil de comprender: de decisiones técnicas a una herramienta que organiza trabajo real. Fragmented es más directo para vender integraciones; Depth aporta profundidad visual, pero exige más interpretación y pierde detalle en pantallas pequeñas.

### Grabaciones y estados

Las grabaciones comparan una captura de la composición de Iteración 8 (primeros dos segundos) con la reproducción real del prototipo. Se capturaron fotogramas consecutivos del navegador durante la animación, conservando sus intervalos; no son interpolaciones entre capturas estáticas. La captura ronda 17–19 imágenes/segundo y se codificó a 24 fps: **no usar estos vídeos para juzgar la tasa de cuadros real de GSAP**. Revisar fluidez en el laboratorio.

- [Fragmented — comparación](fragmented-comparison.mp4): [inicial](fragmented-start.jpg), [intermedio](fragmented-middle.jpg), [final](fragmented-final.jpg), [móvil](fragmented-mobile.jpg), [tablet](fragmented-tablet.jpg).
- [Blueprint — comparación](blueprint-comparison.mp4): [inicial](blueprint-start.jpg), [intermedio](blueprint-middle.jpg), [final](blueprint-final.jpg), [móvil](blueprint-mobile.jpg), [tablet](blueprint-tablet.jpg).
- [Depth — comparación](depth-comparison.mp4): [inicial](depth-start.jpg), [intermedio](depth-middle.jpg), [final](depth-final.jpg), [móvil](depth-mobile.jpg), [tablet](depth-tablet.jpg).

Todos los datos de las interfaces son ilustrativos, identificados como prototipos y no como trabajos de clientes. La versión móvil reorganiza las ventanas y el plano en vertical, reduce inclinaciones y usa navegación horizontal en la interfaz de producto. Con movimiento reducido se muestra el resultado; los estados se pueden explorar instantáneamente sin reproducir animaciones.

## Diagnóstico del CLS

Comparación base:

- `main`: `983cda3f4a51e37d3af391f10a72a51a2ae7590f`.
- Iteración 8: `2ca832a9d0f522e9d538eb4c7012d253f646e08e`.
- Corrección local: Iteración 8 + soporte de hidratación i18n + alcance explícito del escaneo Tailwind; sin cambios visuales corporativos.

**Causa comprobada:** el template raíz contiene bloques `i18n`, pero el proveedor de hidratación no habilitaba `withI18nSupport()`. Angular generaba `<app-root ngskiphydration>` y `__nghData__:[]`. Al arrancar el cliente descartaba el árbol prerenderizado; durante la carga de la ruta lazy quedaban el header y el footer sin el contenido central. El footer subía hasta `y=77` y luego era empujado fuera del viewport al montar la homepage.

En el trace de Chrome de Iteración 8 se registra un `LayoutShift` de **0,4046172539489672**, sin entrada reciente del usuario: nodo 19, rectángulo anterior del footer `[0,77,412,333]`, desplazamiento máximo de 10.472,625 px. La secuencia de capturas del trace muestra el contenido ausente y su posterior montaje. Los recursos GSAP/ScrollTrigger terminan de cargar después de ese salto: no hay evidencia para atribuirles este CLS. Las dimensiones del diagrama están reservadas. La sustitución de fuentes puede causar desplazamientos pequeños, pero no explica la desaparición de toda la ruta.

Se agregó `withI18nSupport()` conservando event replay. El SSG corregido incluye `ngh="8"` en la raíz y metadatos de hidratación. El primer trace de confirmación registró **CLS 0,0000499868**, limitado a dos microtextos del diagrama que se movieron 6 px; desapareció el salto del footer. El check de build ahora falla si alguna ruta corporativa pierde metadatos de hidratación o vuelve a marcar su raíz `ngskiphydration`.

El fallo es sensible al momento de pintado: algunas ejecuciones de main/I8 dan CLS cero aunque sigan descartando la raíz. Por eso un único Lighthouse sin salto no demuestra que la causa desapareció. La evidencia combina SSG, trace, filmstrip y corrección de hidratación, no sólo una puntuación.

Además, Tailwind estaba escaneando HTML de reportes QA y podía incorporar utilidades ajenas a la web. Se delimitó el escaneo a `src/`: CSS corporativo de 8,15 kB con el mismo hash `styles-54USKVGQ.css` en los tres builds comparados; el laboratorio no infla ese CSS.

Fuentes técnicas: [hidratación i18n de Angular](https://angular.dev/guide/hydration#i18n), [withI18nSupport](https://angular.dev/api/platform-browser/withI18nSupport), [diagnóstico CLS de Chrome](https://developer.chrome.com/docs/performance/insights/cls-culprit), [detección de fuentes de Tailwind](https://tailwindcss.com/docs/detecting-classes-in-source-files).

## Mediciones comparables finales

Tres ejecuciones por variante, secuenciales y alternadas main → I8 → corregida, entre 13:12 y 13:15 UTC. Mismos paquetes instalados (Node 24.13.0, Angular 21.2.25/CLI 21.2.26, GSAP 3.15.0), builds de producción, mismo servidor estático local y CSS de 8,15 kB. Los dos commits base se construyeron desde archivos aislados de Git. Sin servidor de desarrollo ni HMR en las páginas medidas.

Lighthouse 13.5.0, Chrome headless 156 en Windows, perfil nuevo por ejecución, emulación móvil 412 × 823 / DPR 1,75, CPU ×4, red simulada con RTT 150 ms y 1.638,4 Kbps. URLs: main `127.0.0.1:4204`, I8 `127.0.0.1:4206`, corrección `127.0.0.1:4202`. El puerto cambia, el servidor y las condiciones de Lighthouse no. El equipo también ejecuta aplicaciones del usuario: no es un banco físico dedicado. No se realizaron builds simultáneos durante esta serie.

| Variante | Performance (3 runs) | CLS (3 runs) | LCP mediana | TBT mediana |
| --- | --- | --- | --- | --- |
| main | 65 / 65 / 47 | 0 / 0 / 0,404617 | 5,90 s | 84,5 ms |
| Iteración 8 | 65 / 45 / 46 | 0 / 0,404667 / 0,404617 | 6,00 s | 126 ms |
| Corrección local | 56 / 66 / 65 | 0 / 0,000050 / 0,000050 | 5,98 s | 89,5 ms |

La corrección cumple CLS ≤ 0,1 en 3/3 ejecuciones. Su Performance mediana es 65 (main: 65, I8: 46); LCP y TBT medianos quedan próximos a main. La primera ejecución corregida fue más lenta (LCP 6,72 s / TBT 284,5 ms), por eso se conserva la dispersión y no se comunica solamente el mejor resultado. **LCP ~6 s sigue siendo un pendiente de rendimiento móvil**, fuera de la corrección puntual de CLS. No se afirma equivalencia estadística ni rendimiento de dispositivos reales con esta muestra pequeña.

Datos completos: [measurements.json](measurements.json). Reportes comprimidos de ejecuciones representativas: [main](main.lighthouse.json.gz), [I8](iteration8.lighthouse.json.gz), [corregida](fixed.lighthouse.json.gz). Los traces de Chrome correspondientes son [main](main.trace.json.gz), [I8](iteration8.trace.json.gz) y [corregida](fixed.trace.json.gz); descomprimir el gzip y cargar el JSON en **DevTools → Performance → Load profile**. Los archivos `*.layout-shifts.json` preservan los eventos relevantes sin el resto del trace. [Filmstrip antes](trace-before.jpg) / [después](trace-after.jpg) del montaje fallido, extraído del trace de diagnóstico inicial.

Comando usado para cada medición (CLI ya disponible en la caché local; ajustar su ubicación si cambia):

```powershell
node .npm-cache/_npx/1722e863ebfd623b/node_modules/lighthouse/cli/index.js http://127.0.0.1:4202/ --output=json --output-path=./artifacts/audit.json --save-assets --chrome-flags=--headless --quiet
```

`benchmark.mjs` conserva el bucle exacto de la serie; ejecutar desde la raíz del repositorio, con los tres servidores de los builds equivalentes ya activos. No es una herramienta de producción.

## Validación y límites

- Build corporativo optimizado: correcto, 5 rutas prerenderizadas; 319,58 kB iniciales / 90,88 kB de transferencia estimada.
- Build optimizado del laboratorio: correcto; separado de la salida corporativa.
- 32 pruebas Angular aprobadas en 10 archivos.
- Check de publicación: 5 rutas y 115 enlaces; nuevas comprobaciones de hidratación aprobadas.
- Comprobación local de función: GET 200, POST 503 controlado y DELETE 405. No se enviaron correos ni se cambiaron variables.
- Revisión visual: escritorio 1440 px, tablet 768 px y móvil 390 px. Se corrigieron recortes de la tabla móvil y del encuadre de las capas; no se detectó scroll horizontal en el laboratorio.
- Teclado: selección de estados con Enter, movimiento reducido con Espacio; reproducción deshabilitada en modo reducido y estados instantáneos disponibles. Implementación escucha la preferencia del sistema y limpia GSAP, ResizeObserver y listeners al destruirse.
- Las métricas son locales con emulación móvil, no datos de usuarios reales ni de Vercel. No se midió en dispositivos físicos, Safari ni Firefox. La validación visual final y la elección de concepto quedan pendientes de aprobación.

## Archivos de implementación

Comandos de validación utilizados:

```powershell
.\scripts\npm.ps1 run build
node node_modules/@angular/cli/bin/ng.js build creative-lab
.\scripts\npm.ps1 test
node scripts/check-build.mjs
node scripts/check-function.mjs
node node_modules/prettier/bin/prettier.cjs --check labs/creative angular.json src/app/app.config.ts src/styles.css
git diff --check
```

Chrome/Lighthouse y el check de función requirieron permisos de ejecución fuera de la sandbox: el primer intento restringido no pudo iniciar Chrome o conectar con el puerto efímero de loopback. Las repeticiones autorizadas se ejecutaron localmente. No se usaron credenciales de producción.

- `src/app/app.config.ts`: corregir hidratación de contenido traducible.
- `src/styles.css`: limitar el escaneo de Tailwind al código corporativo.
- `scripts/check-build.mjs`: detectar regresión de hidratación en SSG.
- `angular.json`: proyecto local independiente `creative-lab`.
- `labs/creative/`: entrada Angular, plantilla de las tres escenas, estilos, timeline y controles accesibles.
- `docs/qa/creative-experience/`: informe, mediciones, traces comprimidos, capturas y grabaciones.

No se integró ningún concepto en la homepage, ni se tocó contacto, configuración de producción, DNS o credenciales. No hay push ni publicación. Detenerse aquí para aprobación del concepto antes de integrar.
