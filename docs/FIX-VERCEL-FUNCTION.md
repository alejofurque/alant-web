# Corrección de empaquetado de contacto — 13/10/2026

## Estado

Corrección validada localmente con Node 24.13.0, TypeScript 5.9.3 y el empaquetador oficial `@vercel/node@23.0.1`. **No se publicó ni se modificaron variables de entorno.** El GET público a `https://alantapp.com/api/contact` todavía devolvió 500 `FUNCTION_INVOCATION_FAILED` durante esta revisión, antes de desplegar la corrección.

No se inició una aplicación en 4200 ni se intervino en ese proceso. Las pruebas HTTP usan un puerto efímero asignado por el sistema operativo. No se enviaron correos ni se contactó a Resend/Upstash en las pruebas locales.

## Causa raíz reproducida

El repositorio tiene `api/contact.ts`, no `api/contact.js`. El segundo es un archivo generado por Vercel.

Sin una configuración próxima al entrypoint, el empaquetador encuentra el `tsconfig.json` de Angular. Este conserva imports y no configura `rewriteRelativeImportExtensions`. El `server/tsconfig.json`, usado por `check:server`, no gobierna la compilación del entrypoint en `api/`.

Se reprodujo el error mediante el build oficial de la función en una copia aislada de los archivos relevantes:

- El artefacto contiene `api/contact.js`, `server/contact.js` y `server/contact-validation.js` (más mapas y `package.json`).
- El JavaScript original mantiene `from '../server/contact.ts'` y `from './contact-validation.ts'`.
- Los `.ts` ya se han convertido en `.js` y no están en el artefacto. Node falla al importar la función con `ERR_MODULE_NOT_FOUND`, antes de acceder a los proveedores.
- Los tests anteriores ejecutaban TypeScript directamente con Node; por ello podían pasar sin detectar este fallo del código emitido.

No faltaba una credencial ni un SDK. Añadir archivos `.ts` al paquete o habilitar el contacto no resuelve correctamente la discrepancia entre imports y archivos emitidos.

## Solución

`api/tsconfig.json` extiende la configuración estricta NodeNext del servidor, habilita emisión y `noEmitOnError`, y activa `rewriteRelativeImportExtensions`. El empaquetador encuentra esta configuración desde el entrypoint y emite imports `.js` que corresponden a los archivos realmente incluidos. No se cambia el entrypoint, la lógica del servidor, Angular, el diseño ni `vercel.json`.

No se necesita `includeFiles`: el rastreo de dependencias ya incluye ambos módulos. El artefacto comprobado no requiere paquetes de terceros en runtime: sólo APIs nativas de Node, incluido `fetch`.

`scripts/check-function.mjs`, integrado en `postbuild` y disponible como `npm run check:function`, compila con esa misma configuración y prueba el JavaScript en un proceso independiente, sin credenciales ni soporte de TypeScript. Rechaza imports residuales a `.ts`, comprueba los módulos esperados y realiza solicitudes HTTP locales. El proceso de prueba bloquea el acceso externo desde el handler.

`scripts/check-vercel-function.mjs` permite repetir el build de la función con el empaquetador oficial instalado temporalmente fuera del proyecto. Extrae los archivos producidos, guarda su manifiesto y ejecuta las mismas pruebas aisladas. Es una auditoría del builder Node; no sustituye el build completo del proyecto vinculado en Vercel.

## Validaciones

| Comprobación                                    | Resultado                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artefacto original de `@vercel/node`            | Reproduce `ERR_MODULE_NOT_FOUND` al buscar `server/contact.ts`                                                                                   |
| Artefacto corregido de `@vercel/node`           | Importa correctamente; runtime `nodejs24.x`, handler `api/contact.js`                                                                            |
| GET del artefacto sin configuración habilitada  | 200, `{"enabled":false}`, `Cache-Control: no-store`                                                                                              |
| POST del artefacto sin configuración habilitada | 503, `{"error":"unavailable"}`                                                                                                                   |
| DELETE del artefacto                            | 405, `{"error":"method"}`                                                                                                                        |
| `npm run build`                                 | Angular y postbuild correctos; 5 rutas prerenderizadas; smoke test de función correcto                                                           |
| `npm run check:server`                          | Correcto                                                                                                                                         |
| `npm run test:server`                           | 14 pruebas correctas; proveedores simulados                                                                                                      |
| `npm test`                                      | 32 pruebas correctas en 10 archivos                                                                                                              |
| `npm run check:build`                           | 5 rutas y 115 enlaces locales correctos                                                                                                          |
| `vercel build --prod` (CLI 63.1.2)              | No pudo iniciar: `project_settings_required`, sin configuración de proyecto enlazada localmente. No se ejecutó `pull` ni se descargaron secretos |
| `npm run format:check`                          | Reporta 25 archivos preexistentes ajenos a la corrección; no se reformatearon                                                                    |

Las pruebas del backend cubren validación, origen, honeypot, consentimiento, banderas, límites, fallo cerrado de Redis, idempotencia, Reply-To y errores de Resend. Son pruebas aisladas: **no acreditan recepción real ni configuración remota**. `CONTACT_DELIVERY_VERIFIED` no fue alterada.

Archivos de la función comprobada:

```text
api/contact.js
api/contact.js.map
server/contact.js
server/contact.js.map
server/contact-validation.js
server/contact-validation.js.map
package.json
```

## Repetir la validación

Desde la raíz, usar Node 24 y las dependencias del lockfile. En este equipo, ejecutar npm mediante `./scripts/npm.ps1`:

```powershell
.\scripts\npm.ps1 run build
.\scripts\npm.ps1 run check:server
.\scripts\npm.ps1 run test:server
.\scripts\npm.ps1 test
.\scripts\npm.ps1 run check:build
```

Auditoría opcional del empaquetado, sin instalar dependencias en el proyecto, autenticar Vercel o publicar:

```powershell
$taskTools = Join-Path $env:TEMP 'alant-vercel-function-audit'
.\scripts\npm.ps1 install --prefix $taskTools --no-audit --no-fund @vercel/node@23.0.1
node scripts/check-vercel-function.mjs (Join-Path $taskTools 'node_modules')
```

El script conserva los artefactos y el manifiesto bajo `artifacts/vercel-function-*`, ignorado por Git. Sólo copia una lista explícita de fuentes y configuraciones; no copia `.env`. Omite instalación y build Angular dentro de ese fixture: la compilación Angular se comprueba por separado con el comando normal.

## Despliegue controlado y comprobación remota

1. Revisar y commitear esta corrección en una rama de trabajo. No hacer push a `main` si eso dispara Production antes de aprobar la versión.
2. Crear un Preview desde ese commit, conservando las banderas de seguridad. Para comprobar la carga del módulo no hace falta habilitar el contacto ni proporcionar credenciales.
3. Confirmar en los Build Logs que se usa la nueva configuración y que el postbuild pasa. Revisar en el artefacto la presencia de los tres `.js` y sus imports `.js`.
4. Con el contacto deshabilitado, comprobar GET 200 `{"enabled":false}` y POST 503 controlado. Revisar Runtime Logs: no debe aparecer `ERR_MODULE_NOT_FOUND`. No enviar POST al entorno público si está habilitado; ensayar entrega únicamente en el Preview protegido autorizado.
5. Aprobar el commit exacto antes de desplegarlo a Production. Mantener los valores actuales de habilitación; no usar esta corrección como justificación para marcar entrega o privacidad como verificadas.
6. Después del despliegue, repetir GET en `https://alantapp.com/api/contact` y revisar Runtime Logs. Si la configuración está completa y aprobada, GET puede devolver `enabled:true`; de lo contrario debe devolver `enabled:false`, sin 500 de importación. Un GET correcto no prueba conectividad con Upstash ni entrega de Resend.
7. La prueba de envío real, recepción en Gmail, Reply-To y controles contra abuso sigue el procedimiento de [CONTACTO-INTEGRACION.md](CONTACTO-INTEGRACION.md) en Preview protegido. Registrar su resultado antes de habilitar recolección pública.

Referencias: [reescritura de extensiones en TypeScript](https://www.typescriptlang.org/tsconfig/rewriteRelativeImportExtensions.html), [runtime Node de Vercel](https://vercel.com/docs/functions/runtimes/node-js) y [empaquetador oficial](https://github.com/vercel/vercel/tree/main/packages/node).
