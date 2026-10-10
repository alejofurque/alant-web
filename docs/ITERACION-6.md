# Iteración 6 — Contacto comercial

Fecha: 10/10/2026. Código implementado y validado localmente; **activación y recepción real pendientes de configuración externa**. No se desplegó en producción ni se modificó DNS.

## Cambios

- Función Vercel `/api/contact` sobre Node 24, compatible con el Angular SSG existente. Envío mediante API REST de Resend, sin backend permanente ni nuevos paquetes.
- Destinatario privado configurable mediante `CONTACT_TO_EMAIL`; el valor solicitado está en `.env.example`. Se retiró el email anterior de la aplicación y se evitaron direcciones personales en el sitio público. El remitente debe ser una dirección válida para Resend, distinta del destinatario Gmail.
- `Reply-To` con el email validado del visitante. Emails estructurados en texto y HTML escapado. Éxito sólo tras recibir un ID de Resend; no implica entrega final o lectura en Gmail.
- Validación frontend/backend, límite de cuerpo, origen permitido, honeypot, límites atómicos por IP/email/global en Upstash Redis y deduplicación mediante idempotencia de Resend.
- Consulta de disponibilidad después de hidratar; ante falta de configuración o servicio, el formulario queda deshabilitado. El HTML prerenderizado nunca inicia habilitado.
- Consentimiento obligatorio, aviso de privacidad configurable y versionado, sin identidad legal inventada. Se exige aprobación explícita del texto antes de habilitar el canal.
- Estados de envío, error y recepción; conservación de datos ante error; mensaje específico para límites; cancelación y prevención de doble envío. Una prueba detectó y permitió corregir el foco sobre clases DOM todavía desactualizadas: ahora se usa el estado real de los controles.
- Se preservaron retícula, colores, tipografía, tarjetas y composición de Contacto. La tarjeta conserva su diseño y ahora apunta al formulario. La homepage dirige su CTA a Contacto. No se tocaron animaciones.

## Archivos

| Área                   | Archivos creados o modificados                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Función y lógica       | `api/contact.ts`, `server/contact.ts`, `server/contact-validation.ts`, `server/contact.test.ts`, `server/tsconfig.json`                                                                                                             |
| Despliegue y entorno   | `vercel.json`, `.env.example`, `.gitignore`                                                                                                                                                                                         |
| Frontend               | `src/app/core/site.config.ts`; `src/app/features/contact/contact-gateway.ts`, `contact-gateway.spec.ts`, `contact-form.ts`, `contact-form.html`, `contact-form.css`, `contact-form.spec.ts`, `contact-page.ts`, `contact-page.html` |
| Homepage               | `src/app/features/home/contact/contact.ts`, `contact.html`, `src/app/features/home/home.spec.ts`                                                                                                                                    |
| Tooling                | `package.json`, `package-lock.json`, `scripts/preview.mjs`, `scripts/check-build.mjs`                                                                                                                                               |
| Idioma y documentación | `src/locale/messages.xlf`, `README.md`, `docs/CONTACTO-INTEGRACION.md`, este informe                                                                                                                                                |

El lockfile sólo incorpora la declaración del runtime Node; no se añadieron dependencias. El código del servidor queda fuera de `src/` y de la salida pública Angular.

## Validación

Comprobación HTTP local del endpoint sin credenciales: `GET /api/contact` respondió **200** con `{"enabled":false}` y `Cache-Control: no-store`; `POST /api/contact` respondió **503**, sin llamar al proveedor. El preview necesitó ejecutarse fuera del sandbox para permitir conexiones de loopback.

| Comprobación                       | Resultado                                                                                                                                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/npm.ps1 run build`        | Correcto; 5 rutas SSG, sin advertencias de presupuesto.                                                                                                                                                                      |
| `scripts/npm.ps1 test`             | **32 pruebas Angular en 10 archivos**, correctas. La primera ejecución no pudo usar temporales dentro del sandbox de Windows; se repitió con permisos y se corrigió el foco detectado por la nueva prueba de consentimiento. |
| `scripts/npm.ps1 run test:server`  | **14 pruebas de servidor**, correctas. Sin conexiones reales a Resend o Redis.                                                                                                                                               |
| `scripts/npm.ps1 run check:server` | TypeScript estricto del servidor y entrypoint Vercel, correcto.                                                                                                                                                              |
| `scripts/npm.ps1 run check:build`  | 5 rutas, **113 enlaces**, estructura y metadatos, formulario deshabilitado en SSG, sin emails personales ni claves de servidor en archivos públicos.                                                                         |
| `scripts/npm.ps1 run i18n:extract` | Correcto; **317 mensajes**.                                                                                                                                                                                                  |
| `scripts/npm.ps1 run format:check` | Revisión de formato del frontend, servidor, función y configuración.                                                                                                                                                         |

Bundle inicial: **317,64 kB**, transferencia estimada **90,28 kB**. Contacto diferido: **59,23 kB**, transferencia estimada **13,73 kB**. No se relajaron presupuestos.

Las pruebas aisladas comprueban contratos y comportamiento ante respuestas de proveedores controladas: validación e inyección, consentimiento, versión de aviso, tamaño de cuerpo, método/origen, configuración cerrada, límites, seudonimización de claves, IPv6 /64, idempotencia estable y fallos del proveedor. No prueban ejecución del script Lua en una base Redis real, DNS, reputación del remitente o entrega en Gmail.

La herramienta de navegador rechazó el acceso a la vista local por su política de URL. No se intentó eludir esa restricción. **No se hizo una nueva revisión visual, de responsive o teclado en navegador en esta iteración**; la verificación de foco y mensajes accesibles fue automatizada con Angular. Las capturas de iteración 5 son históricas y no se presentan como evidencia de estos cambios.

## Configuración externa necesaria y punto de detención

La guía [CONTACTO-INTEGRACION.md](CONTACTO-INTEGRACION.md) contiene variables, contrato, límites, privacidad, fuentes oficiales y el procedimiento completo de activación. Faltan:

1. Cuenta Resend, dominio/remitente verificado y API key de envío. Los registros DNS deben copiarse del panel real cuando se autorice, sin inventarlos.
2. Base Upstash Redis y credenciales REST; secreto independiente para HMAC.
3. Origen exacto del preview autorizado y, posteriormente, el de producción.
4. Identidad del responsable, criterio de conservación y canal de privacidad para completar y aprobar el aviso público.
5. Un ensayo real de recepción, Reply-To, errores, reintentos e idempotencia en Preview; verificar también límites Redis y rutas en Vercel.

El formulario queda deshabilitado hasta completar configuración y aprobación. La bandera de verificación de entrega se exige en producción; un preview configurado permite realizar la primera prueba real. No se cargaron credenciales ni se enviaron mensajes. La implementación se detiene aquí para recibir esa configuración externa, conforme al alcance solicitado.
