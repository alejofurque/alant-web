# Auditoría de producción — cierre 11/10/2026

**El contacto todavía no está verificado para habilitarse en producción.** No se enviaron correos, no se cambiaron indicadores, variables remotas ni DNS y no se publicó este cambio. Por indicación del responsable, las comprobaciones que requieren acceso al panel quedan a su cargo.

## Evidencia y alcance

Las respuestas HTTP y las pruebas de proveedores están guardadas con fecha UTC en `qa/production-audit/deployment.json` y `providers.json`. Son observaciones de esa ejecución, no un monitor continuo.

| Comprobación | Resultado observado |
| --- | --- |
| Inicio, Servicios, Estudio, Contacto | HTTP 200, títulos propios; contacto deshabilitado también en navegador |
| `/api/contact` | HTTP 500. No se pudo identificar la excepción sin los logs de Vercel |
| HTTP → HTTPS | 308 tanto en apex como en www; HTTPS con HSTS |
| HTTPS www → apex | 307 hacia `https://alantapp.com/`; conviene 308 si la preferencia es permanente |
| Ruta inexistente | Devuelve Inicio con 200: soft 404, pendiente corregir la configuración efectiva del hosting |
| Canonical publicado | Ausente en las cuatro rutas; corregido en el código local |
| Indexación | `noindex, nofollow` y robots `Disallow: /`. Se conserva el bloqueo de revisión |
| Sitemap publicado | `/sitemap.xml` devuelve Inicio con 200, no XML. El build no genera sitemap mientras indexación esté deshabilitada; el hosting debería devolver 404 |
| Proyectos vacíos | Visibles en el despliegue inspeccionado; eliminados del render local, manteniendo componentes reutilizables |
| Upstash con credenciales locales | PING correcto. EVAL real, clave aislada con TTL 30 s: dos operaciones permitidas y tercera limitada. Sin tocar contadores de visitantes |
| Resend con credencial local | Lectura de dominios/emails rechazada con `restricted_api_key`. No demuestra que la clave de envío sea inválida ni que el dominio esté verificado |
| Recepción Gmail | Buzón receptor conectado; búsqueda `in:anywhere newer_than:30d subject:("Consulta ALANT")` sin coincidencias. No equivale a una prueba de entrega |

## Variables e indicadores

No se pudo verificar la selección **Production**, los valores efectivos ni su lectura por la función desplegada. Un `.env` local no prueba ninguna de esas condiciones. El handler local lee configuración mediante `process.env`; con configuración incompleta devuelve GET `{ "enabled": false }` y POST 503. El 500 remoto requiere revisar primero los logs de ejecución, sin atribuirlo automáticamente a una variable faltante.

El archivo local tiene credenciales Resend/Upstash y remitente/destinatario, pero le faltan `CONTACT_ALLOWED_ORIGIN`, `CONTACT_HASH_SECRET`, `CONTACT_PRIVACY_NOTICE` y `CONTACT_PRIVACY_VERSION`. Sus tres indicadores están en `false`. No se modificaron ni se copiaron a Vercel.

Para revisar en Vercel:

1. Abrir el proyecto que sirve alantapp.com → Settings → Environment Variables. Confirmar ámbito Production de todas las variables enumeradas en `CONTACTO-INTEGRACION.md`, sin compartir valores secretos.
2. Confirmar `CONTACT_ALLOWED_ORIGIN=https://alantapp.com`, destinatario configurado, remitente de dominio verificado y secreto HMAC de al menos 32 caracteres.
3. Abrir el deployment activo → Runtime Logs y solicitar GET `/api/contact`. Revisar la excepción del 500 y que la función esté incluida en ese deployment. No activar logs de cuerpos ni datos personales.
4. Los cambios de variables deben incorporarse a un nuevo deployment. Mantener `CONTACT_ENABLED=false` y `CONTACT_DELIVERY_VERIFIED=false` hasta completar el ensayo. `CONTACT_PRIVACY_APPROVED` sólo puede reflejar una aprobación real.
5. Revisar rewrites/redirects efectivos: conservar `/api/contact` como función y rutas estáticas; las rutas desconocidas deben servir `404.html` con estado 404, no Inicio con 200. Verificar también `/sitemap.xml` mientras no exista.

## Prueba real controlada, sin abrir el formulario público

Usar un **Preview protegido por autenticación de Vercel**. Una URL difícil de adivinar o `CONTACT_ALLOWED_ORIGIN` no sustituyen esa protección. Confirmar desde una ventana sin sesión que tanto la página como `/api/contact` requieren autenticación. No usar una URL Production pública para este ensayo.

1. En Preview, configurar las credenciales reales y el mismo dominio remitente que se usará en Production. Preferir una base Upstash de prueba. Fijar el origen exacto del Preview y crear un nuevo deployment tras configurar variables.
2. Completar y aprobar el aviso primero. Sólo en Preview: `CONTACT_ENABLED=true`, `CONTACT_PRIVACY_APPROVED=true`, `CONTACT_DELIVERY_VERIFIED=false`. El código permite la primera prueba en Preview sin fingir verificación previa. Production sigue cerrado.
3. Confirmar GET 200 con `enabled: true`, aviso y versión, sin secretos ni destinatario. Enviar manualmente una consulta identificada como prueba usando nombre y email propios y consentimiento real.
4. Confirmar ID/aceptación de Resend, evento de entrega en su panel y recepción en Gmail, incluida carpeta spam. Revisar remitente, cuerpo, caracteres y empresa opcional. Abrir «Responder» y comprobar que el destinatario es el email del visitante de prueba; no hace falta enviar esa respuesta.
5. Repetir exactamente el mismo contenido dentro de 24 horas: debe reutilizar idempotencia de Resend y no generar un segundo correo. Los reintentos consumen cuota. Un doble clic durante loading no debe iniciar dos solicitudes desde Angular.
6. Comprobar el límite por email en el Preview: la cuarta solicitud válida del mismo email dentro de una hora devuelve 429 y `Retry-After`. Para comprobar IP, usar solicitudes inválidas sin datos personales: el intento 11 dentro de 15 minutos debe quedar limitado. No hacer pruebas de carga en Production. Contadores previos pueden adelantar el bloqueo; esperar expiración o usar el entorno de prueba limpio.
7. Probar fallos únicamente en Preview: credencial Upstash incorrecta debe impedir el envío; Resend incorrecto debe dar error, nunca éxito. Restaurar las variables y volver a desplegar. Los demás límites y casos de error están cubiertos por tests con proveedores simulados.
8. Registrar fecha, deployment, ID del mensaje y resultados sin datos del prospecto. Sólo después de recepción y Reply-To confirmados establecer `CONTACT_DELIVERY_VERIFIED=true` para Production. Tras aprobación del aviso y del lanzamiento, habilitar `CONTACT_ENABLED=true`, desplegar y verificar GET/POST y una consulta propia. Si falla, volver a deshabilitar.

## Privacidad pendiente

No se encontró un aviso local completo ni uno visible en el formulario deshabilitado; no se pudo revisar el valor remoto. No hay evidencia de aprobación. La validación de longitud del servidor no acredita cumplimiento legal.

El responsable debe proporcionar y aprobar su identidad real, contacto para privacidad/derechos, finalidad y fundamento aplicable del tratamiento, datos solicitados, conservación real, proveedores (Vercel, Resend, Upstash y buzón receptor), transferencias y procedimientos de derechos según jurisdicción. No se inventaron esos datos. El consentimiento debe referirse a esa versión final. Esta lista es de información pendiente, no una certificación legal.

## Cambios locales y validación

- `src/app/features/home/home.ts`: no monta la sección de proyectos; componentes y fichas se conservan para material futuro.
- `process/process.html` y `contact/contact.html`: numeración de secciones consecutiva, sin rediseño.
- `src/app/core/publication.json`: origen confirmado `https://alantapp.com`; canonical y Open Graph coherentes. Indexación permanece deshabilitada.
- `home.spec.ts`, `page-seo.spec.ts`, `scripts/check-build.mjs`: regresiones de ausencia real de placeholders y canonical.
- `scripts/audit-production.mjs` y `audit-contact-providers.mjs`: diagnósticos explícitos sin envío de emails; el segundo sólo modifica claves efímeras de diagnóstico al pasar `--limiter`.
- Documentación, catálogo i18n y evidencia de QA actualizados.

Validación final: build con 5 rutas prerenderizadas; 32 pruebas Angular y 14 pruebas de servidor aprobadas; comprobación TypeScript del servidor; 112 enlaces locales y metadatos/HTML/ausencia de destinatario privado verificados. Reply-To, idempotencia, validación, límites y errores pasan con proveedores simulados; eso no sustituye el ensayo remoto. El build inicial es 317,22 kB (transferencia estimada 90,18 kB); no se hizo una medición Lighthouse.

La inspección de navegador de esta auditoría corresponde al sitio publicado. Los cambios locales se validaron mediante tests y HTML prerenderizado; no se afirma una nueva revisión visual responsive del build modificado. Los cambios requieren despliegue para reflejarse en alantapp.com.

Referencias: [variables de Vercel](https://vercel.com/docs/environment-variables), [protección de deployments](https://vercel.com/docs/deployment-protection), [idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).
