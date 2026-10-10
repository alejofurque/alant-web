# ALANT — QA de hitos 0 y 1

Fecha: 8 de octubre de 2026. Alcance: setup y homepage local. No hubo publicación ni cambios de dominio.

## Comprobaciones realizadas

| Comprobación | Resultado |
| --- | --- |
| Build de producción | Correcto; una ruta prerenderizada (`/`), sin advertencias |
| HTML sin ejecutar JavaScript | H1, secciones y contenido presentes; `lang=es`, title, description y Open Graph correctos |
| Salida SSG | `dist/alant-web/browser/index.html`; sin servidor de producción |
| Vitest | 3 archivos, 3 pruebas aprobadas |
| Enlaces | Todas las anclas resuelven; ningún enlace a páginas internas inexistentes |
| Contacto | Descarga real de guía; advertencia visible de que no se envía información |
| i18n | Extracción XLIFF 2 correcta; 118 mensajes con IDs estables |
| Fuentes | Geist Sans y Mono locales, licencia incluida, carga verificada |
| Responsive | 1440, 768, 390 y 360 px revisados visualmente; sin overflow horizontal |
| Teclado | Menú, Escape/foco, pestañas con flechas/Home/End y foco visible revisados |
| Contraste de texto | 87 fragmentos renderizados comprobados según umbrales WCAG AA (4.5:1 normal, 3:1 grande); ninguno por debajo |
| Consola | Sin errores ni advertencias en la sesión de revisión |
| Movimiento reducido | Regla `prefers-reduced-motion` desactiva animaciones y transiciones; scroll suave desactivado |
| Dependencias | Instalación/auditoría npm: 0 vulnerabilidades reportadas |

El build final informa 285.24 kB iniciales y 49.83 kB del chunk de homepage; transferencia estimada total aproximada de 93.7 kB para JS/CSS, aparte de fuentes y HTML. Es una estimación del compilador, no una medición de red ni una puntuación de Lighthouse.

## Comandos ejecutados

```text
ng new alant-web --directory . --skip-install --skip-git --ssr --style css --routing --strict --defaults --ai-config none
npm install
npm install @angular/localize@21.2.25
npm install -D tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 postcss geist
npm uninstall express @types/express @angular/forms
npm uninstall geist
node node_modules/@angular/cli/bin/ng.js build
node node_modules/@angular/cli/bin/ng.js test --watch=false
node node_modules/@angular/cli/bin/ng.js extract-i18n
node scripts/check-build.mjs
node node_modules/prettier/bin/prettier.cjs --check src scripts/*.mjs angular.json package.json .postcssrc.json
node scripts/preview.mjs
```

Las invocaciones npm se hicieron mediante su CLI local debido al launcher roto del equipo. El primer build dentro del sandbox falló por restricciones de lectura de esbuild; las ejecuciones con acceso normal completaron correctamente. Se corrigieron las advertencias de importación de localize al usar el polyfill oficial.

La revisión visual llevó a ampliar el diagrama en tablet (hero apilado hasta 900 px) y a configurar 100 px de desplazamiento para las anclas bajo el header fijo. Las pestañas usan selección y foco propios, controles ARIA y un panel descriptivo. El diagrama del hero incluye una descripción textual accesible.

También se comprobó el salto al contenido con Shift+Tab y Enter: foco visible en el enlace y foco posterior en `main#contenido`. La descarga se ejecutó desde el navegador y produjo `consulta-alant.txt` correctamente; la consola siguió sin errores ni advertencias.

## Capturas

- [Desktop — hero 1440 px](qa/home-desktop-1440.jpg)
- [Desktop — página completa](qa/home-desktop-full.jpg)
- [Tablet — página completa 768 px](qa/home-768.jpg)
- [Mobile — página completa 390 px](qa/home-390.jpg)
- [Mobile — página completa 360 px](qa/home-360.jpg)

## Límites y pendientes

No se ejecutaron Lighthouse/axe, una auditoría completa con lector de pantalla ni pruebas en Safari, Firefox o dispositivos físicos. El movimiento reducido está cubierto por CSS; no se cambió la preferencia del sistema del usuario. La versión inicial y las capturas se verificaron en Chromium del navegador integrado.

Falta confirmar contacto oficial, portfolio verificable y wordmark definitivo. Canonical/URLs públicas/sitemap, inglés completo y hosting pertenecen a la fase posterior. El estado de revisión tiene `noindex` y `robots.txt` bloqueado. No se implementaron páginas internas.
