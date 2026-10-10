# Contacto — Vercel Function y Resend

Estado al 10/10/2026: implementación local preparada; **sin credenciales, sin envío real comprobado y sin despliegue**. Este documento reemplaza la configuración de la iteración 5.

El destinatario comercial confirmado es **alejofurque15@gmail.com**, configurado exclusivamente mediante `CONTACT_TO_EMAIL` en el servidor. El Gmail anterior ya no se utiliza en la aplicación. No hay direcciones personales ni `mailto:` en el HTML o JavaScript públicos. Los informes históricos conservan el estado de sus respectivas iteraciones.

## Arquitectura

`Angular → /api/contact → Resend → buzón comercial`

- Angular mantiene SSG, diseño y rutas. Contacto consulta `GET /api/contact` después de hidratar; recibe solamente disponibilidad y el aviso de privacidad aprobado. El formulario prerenderizado siempre empieza deshabilitado.
- `api/contact.ts` es una Vercel Function Node 24 con Web Standard Request/Response. Usa `server/contact.ts` y `contact-validation.ts`. No hay servidor permanente, Express ni SDK adicional.
- `POST /api/contact` valida y envía un email por la API HTTPS oficial de Resend. El destinatario y el remitente son valores de servidor, nunca campos aceptados del cliente.
- Redis administrado de Upstash mantiene límites compartidos entre instancias. No se utiliza un contador en memoria que se reinicie con cada función.
- `vercel.json` conserva la salida estática `dist/alant-web/browser`, ejecuta el build existente y añade la función sin reescribir todas las rutas a Inicio. El postbuild conserva `404.html`.

No había configuración de despliegue Vercel ni un proyecto `.vercel` enlazado en el repositorio. La configuración creada aún debe comprobarse en un preview de Vercel autorizado. No se ejecutaron comandos de despliegue ni cambios de DNS.

## Variables de entorno

Copiar `.env.example` a un archivo local ignorado sólo cuando se disponga de valores reales. En Vercel, configurar variables de **Preview** y, en una fase posterior autorizada, **Production** por separado. Ninguna clave debe ponerse en Angular, `src/`, `public/` o variables destinadas al navegador.

| Variable                    | Valor o finalidad                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CONTACT_TO_EMAIL`          | `alejofurque15@gmail.com`. Receptor privado.                                                                                     |
| `CONTACT_FROM_EMAIL`        | Una sola dirección en un dominio de envío verificado. Sin nombre de presentación: el servidor añade ALANT. No usar Gmail.        |
| `RESEND_API_KEY`            | Clave de envío de Resend; preferir permisos de envío limitados al dominio correspondiente.                                       |
| `CONTACT_ALLOWED_ORIGIN`    | Origen exacto HTTPS del entorno autorizado, sin slash final ni path. No se deduce de cabeceras enviadas por el visitante.        |
| `UPSTASH_REDIS_REST_URL`    | URL HTTPS de la base Redis de Upstash.                                                                                           |
| `UPSTASH_REDIS_REST_TOKEN`  | Token con acceso a EVAL, INCR, EXPIRE y TTL. Nunca exponerlo en el cliente.                                                      |
| `CONTACT_HASH_SECRET`       | Secreto aleatorio de al menos 32 caracteres, independiente de otras claves. Mantenerlo estable durante las pruebas y reintentos. |
| `CONTACT_PRIVACY_NOTICE`    | Texto público completo y revisado del aviso, en español. No contiene automáticamente el destinatario privado.                    |
| `CONTACT_PRIVACY_VERSION`   | Identificador del aviso aprobado, por ejemplo una versión basada en su fecha real. Actualizarlo si cambia el texto.              |
| `CONTACT_PRIVACY_APPROVED`  | `true` sólo después de completar y aprobar el aviso. Valor inicial: `false`.                                                     |
| `CONTACT_ENABLED`           | `true` para probar el canal en el entorno autorizado con configuración completa. Valor inicial: `false`.                         |
| `CONTACT_DELIVERY_VERIFIED` | En Production se exige `true`, después de comprobar recepción real en Preview. Valor inicial: `false`.                           |

La API se cierra ante configuración incompleta. En Preview se permite ensayar con `CONTACT_DELIVERY_VERIFIED=false`; esto evita exigir una prueba previa para poder hacer la primera prueba. En Production no se permite. No basta con cambiar una bandera del navegador para habilitar el envío.

Para generar el secreto local sin imprimirlo en conversaciones se puede usar un gestor de secretos; si se genera mediante herramientas de Node, guardarlo directamente en el almacén de variables correspondiente. No compartir claves por chat ni incluirlas en commits.

## Activar Resend: pasos manuales

1. Crear o utilizar una cuenta Resend propia. Elegir un dominio o subdominio controlado para los envíos. No se presupone que ningún dominio esté verificado.
2. Añadir ese dominio en Resend y copiar **exactamente los registros que muestre su panel** al proveedor DNS cuando se autorice ese cambio. No se proporcionan nombres ni valores DNS inventados en este repositorio.
3. Esperar a que Resend confirme la verificación. Configurar `CONTACT_FROM_EMAIL` con una dirección de ese dominio. El destinatario Gmail no necesita ser el dominio remitente.
4. Crear la clave de API de envío y guardarla como `RESEND_API_KEY` sólo en el servidor.
5. Para una prueba inicial, `onboarding@resend.dev` sólo sirve dentro de las restricciones de Resend y del destinatario de la cuenta. No se asume que el Gmail solicitado sea el correo de la cuenta Resend. No usar ese remitente en producción: la función lo rechaza allí.
6. Preparar Redis y el aviso de privacidad antes de habilitar Preview. Con todas las variables completas, realizar el ensayo de entrega descrito abajo. No marcar verificación por un test unitario.

## Seguridad y límites

- Sólo GET/POST; POST exige JSON y un origen permitido exacto. `Sec-Fetch-Site`, cuando está presente, debe ser `same-origin`. No hay CORS abierto. El origen no es autenticación ni sustituye el control de abuso.
- Límite de **24 KiB**, comprobado tanto por longitud declarada como durante la lectura. Campos desconocidos, tipos incorrectos, inyección de cabeceras y emails con múltiples destinatarios se rechazan.
- Nombre de 2–100 caracteres; email simple válido de hasta 254; empresa opcional hasta 160; tipo dentro de una lista; descripción de 20–4000. El servidor exige aceptación explícita del aviso y su versión vigente.
- Honeypot vacío y antigüedad de formulario entre 2 segundos y 24 horas. El tiempo del cliente es una señal auxiliar, no una prueba de humanidad. No se usa Turnstile ni se carga un servicio CAPTCHA.
- Límites iniciales: **10 intentos por IP cada 15 minutos**, **3 consultas por email cada hora**, **30 consultas globales cada hora**. Son contadores atómicos con expiración en Redis, no ventanas móviles. Los reintentos también consumen límites; una respuesta 429 incluye `Retry-After`.
- Vercel aporta la IP mediante `x-vercel-forwarded-for`. Fuera de Vercel se usa una identidad local fija; ese modo sólo sirve para desarrollo, no para publicar detrás de otro proxy. IPv6 se agrupa por /64. Un proxy adicional requiere revisar qué IP llega realmente.
- Redis recibe claves HMAC, contadores y expiraciones; no nombre, email en claro, IP en claro ni descripción. Son identificadores seudonimizados, no datos anónimos. Los contadores vencen en un máximo de una hora. Si Redis falla, se impide el envío.
- Resend recibe un email HTML escapado y una versión de texto. `From` viene de configuración; `To` del destinatario privado; `Reply-To` del email validado del visitante. No se envía una confirmación automática al visitante, para evitar convertir el formulario en un emisor hacia terceros.
- Una clave de idempotencia HMAC estable para el mismo contenido evita duplicarlo en la ventana de **24 horas** de Resend, incluso después de perder una respuesta o recargar la página. Un cambio de contenido genera otra clave. No se garantiza deduplicación fuera de esa ventana.
- Timeouts de 3 segundos por petición Redis y 8 segundos en Resend. Se devuelve éxito únicamente con una respuesta correcta e ID de Resend. Ese ID confirma aceptación por el proveedor, no lectura ni entrega final en Gmail.
- La aplicación no registra cuerpos, IPs, emails ni errores detallados del proveedor. Resend, Vercel y Upstash tienen sus propias políticas y registros: deben revisarse al configurar las cuentas. No activar logging de cuerpos del formulario.

Los límites globales protegen el volumen de envíos pero un atacante puede agotarlos temporalmente. Antes del lanzamiento, revisar las reglas de firewall y alertas del plan Vercel y los límites de Resend. Si el tráfico exige un desafío antispam, añadirlo con verificación real en servidor; nunca confiar sólo en un token recibido del cliente.

## Aviso de privacidad y consentimiento

La interfaz incluye un aviso desplegable y una casilla obligatoria, inicialmente sin marcar, que autoriza gestionar y responder la consulta. No autoriza marketing. La versión aceptada se incluye en el email.

No se inventó el nombre legal del responsable, domicilio, plazo de conservación ni canal para ejercer derechos. Para completar `CONTACT_PRIVACY_NOTICE` deben confirmarse:

- Identidad real del responsable y ámbito desde el que opera.
- Finalidad de gestionar y responder consultas comerciales; campos necesarios y empresa opcional.
- Proveedores efectivamente usados: Vercel, Resend, Upstash y el correo receptor; ubicación y condiciones aplicables al tratamiento según las cuentas contratadas.
- Plazo o criterio real para conservar consultas y cómo se gestionará su eliminación.
- Medio real para consultas de privacidad y ejercicio de derechos. Puede ser una dirección comercial distinta del Gmail privado, cuando exista.

La aprobación debe corresponder al texto final y al funcionamiento real, con revisión legal según corresponda. La longitud mínima de la variable es una comprobación técnica, no una validación legal. Un futuro sitio inglés necesitará también una versión revisada del aviso; no traducirlo automáticamente ni publicar un aviso vacío.

## Ensayo real pendiente

En un entorno Preview autorizado (no producción):

1. Verificar dominio/remitente, credenciales, origen exacto, base Redis y aviso aprobado. Configurar `CONTACT_ENABLED=true`.
2. Confirmar que GET devuelve disponibilidad y aviso, sin destinatario ni claves. Revisar también el HTML y los bundles.
3. Enviar una consulta propia de prueba, aceptando el aviso. Confirmar ID de Resend y el evento de entrega en su panel; comprobar bandeja y spam del Gmail receptor.
4. Responder desde Gmail y verificar que el destinatario es el email del visitante de prueba. Revisar caracteres españoles, saltos de línea, empresa vacía, asunto y legibilidad.
5. Repetir el mismo contenido y provocar un reintento tras una respuesta perdida: comprobar que Resend no duplica el email dentro de su ventana. Probar bloqueo por límites y fallo del proveedor sin mensajes falsos de éxito.
6. Revisar consentimiento, foco y errores con teclado. Verificar que rutas corporativas y 404 conservan su comportamiento en Vercel.
7. Registrar resultado real. Sólo entonces preparar `CONTACT_DELIVERY_VERIFIED=true` para un futuro lanzamiento autorizado. La indexación y el dominio de la web siguen gobernados por `publication.json`.

Sin claves ni configuración externa esta fase queda pendiente. No se envían mensajes automáticamente al agregar variables ni al ejecutar build/test.

## Desarrollo local

`npm run preview` sirve el build y adapta `/api/contact` al mismo handler de Vercel usando Node 24. Sin variables devuelve `{ "enabled": false }` y POST devuelve 503. Para una prueba local autorizada con valores reales, Node puede cargar un archivo ignorado con `node --env-file=.env.local scripts/preview.mjs`; el origen será `http://127.0.0.1:4200`. El modo `--static-only` sigue siendo una revisión de HTML sin API.

`ng serve` por sí solo no ejecuta funciones de Vercel: su formulario permanece deshabilitado si no se conecta una API. Para revisar la integración completa, usar el preview indicado o Vercel dev una vez configurado externamente.

## Referencias oficiales consultadas

- [Funciones Node y Web Standard de Vercel](https://vercel.com/docs/functions/runtimes/node-js).
- [Cabeceras de IP de Vercel](https://vercel.com/docs/headers/request-headers).
- [API de envío y Reply-To de Resend](https://resend.com/docs/api-reference/emails/send-email).
- [Verificación de dominios](https://resend.com/docs/dashboard/domains/introduction) e [idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).
- [API REST de Upstash](https://upstash.com/docs/redis/features/restapi) y [EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval).
