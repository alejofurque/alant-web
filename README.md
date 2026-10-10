# ALANT — Software Engineering Studio

Web corporativa en revisión. La **iteración 6** añade el contacto comercial mediante Vercel Function y Resend, pendiente de credenciales y prueba real. Inicio, Servicios, Estudio y Contacto conservan la identidad **Precision Mint / Engineered Systems** y el movimiento aprobado. `ALANT_WEB_STARTER/` contiene el paquete original; las instrucciones actuales están en `AGENTS.md` y `docs/`.

Angular **21.2.25**, CLI/build/SSG **21.2.26**, TypeScript **5.9**, Tailwind CSS **4.3.3**, Node **24.13.0**, npm **11.6.2**. Angular 21 es una rama soportada compatible con el Node instalado; Angular 22 requiere un Node más reciente. Versiones efectivas fijadas en `package-lock.json`.

## Desarrollo y revisión

```powershell
npm ci
npm run dev
npm run build
npm test
npm run test:server
npm run check:server
npm run check:build
npm run i18n:extract
npm run format:check
npm run preview
```

`dev` usa `http://127.0.0.1:4200`. `preview` sirve el build de producción en la misma dirección; ejecutar uno a la vez.

En este equipo el launcher global de npm apunta a una instalación ausente. Sin cambiar la configuración de Windows, puede usarse:

```powershell
.\scripts\npm.ps1 run dev
.\scripts\npm.ps1 run build
.\scripts\npm.ps1 test
```

También se puede ejecutar el CLI directamente: `node node_modules/@angular/cli/bin/ng.js build`. En el entorno restringido de Codex, esbuild necesitó permisos de lectura fuera del sandbox para resolver archivos; el build con acceso normal funciona.

## Arquitectura

- `src/app/shared/`: header, footer, flecha, introducción de página, cierre de consulta y ficha reutilizable de proyectos con medios tipados.
- `src/app/features/home/`: hero, diagrama, capacidades, transformación del sistema, proyectos/demostraciones, proceso y contacto. Componentes standalone, plantillas y estilos por sección.
- `src/app/core/motion/`: carga diferida de GSAP 3.15.0 y ScrollTrigger, preferencias de movimiento y limpieza al destruir componentes. La animación se inicializa después del render en navegador.
- `src/app/features/services/`, `studio/`, `contact/`, `not-found/`: páginas interiores con carga diferida. Estudio reutiliza el proceso de trabajo de la homepage.
- `src/app/core/site.config.ts`: ruta pública del endpoint, sin email personal ni credenciales.
- `api/contact.ts` y `server/`: función de contacto, validación y envío Resend con límites persistentes en Upstash Redis.
- `src/app/core/page-seo.ts` y `publication.json`: metadatos por ruta y configuración explícita de publicación.
- `src/styles.css`: Tailwind v4, tokens de color, tipografía, contenedor y estados de foco.
- `src/app/app.routes.ts`: `/`, `/servicios`, `/estudio`, `/contacto`, `/404` y fallback para rutas inexistentes. No se enlaza ni publica una página de proyectos vacía.
- `src/app/app.routes.server.ts`: las cinco rutas concretas usan `RenderMode.Prerender`.

`angular.json` usa `outputMode: static`. La salida final está en `dist/alant-web/browser/`; no necesita servidor Angular/Express. `vercel.json` prepara esos archivos y una sola función serverless `/api/contact`. `scripts/preview.mjs` adapta esa misma función para revisión local y devuelve el HTML 404 con estado HTTP 404 para direcciones inexistentes. No se desplegó ni se creó un backend permanente o CMS.

Los diagramas son HTML/SVG/CSS propios. El hero se ensambla una vez y permite repetir la secuencia. En escritorio, el scroll transforma los mismos cinco módulos desde sistemas separados hasta una plataforma integrada; en pantallas compactas hay etapas dentro del flujo normal. `prefers-reduced-motion` y el control «Animaciones» ofrecen estados estáticos completos. Los ejemplos son ilustrativos, sin representar proyectos o resultados de clientes. La galería conserva dos espacios reservados, sin capturas, tecnologías ni enlaces inventados. `docs/reference/precision-mint-board.png` no forma parte de los assets de producción.

## Idioma y SEO

Español fuente (`es`), `@angular/localize`, atributos `i18n` e IDs estables, y `$localize` para textos de TypeScript. `npm run i18n:extract` produce `src/locale/messages.xlf`. No hay selector de idioma, ruta `/en/` ni traducciones incompletas. El aviso de privacidad configurado en servidor también deberá localizarse antes de habilitar inglés.

Para activar inglés en una fase posterior: traducir y revisar el catálogo completo, registrar `en` con `subPath: en`, habilitar builds localizados y exigir error ante traducciones faltantes. Adaptar los metadatos de locale y el archivo descargable de contacto. Sólo entonces añadir `hreflang` recíproco. No crear archivos ingleses vacíos.

Cada ruta tiene title, description y Open Graph propios en el HTML prerenderizado y se actualizan al navegar. Los metadatos son traducibles. `publication.json` mantiene `origin: null` e `indexable: false` durante revisión: no se inventan canonicals ni URLs de sitemap. Cuando se confirme el origen HTTPS final, esa configuración alimentará canonical y `og:url`; al habilitar indexación, el postbuild generará sitemap de las cuatro páginas corporativas y robots coherente. La página 404 siempre queda fuera del sitemap y usa `noindex`.

`npm run build` ejecuta `scripts/prepare-publication.mjs` automáticamente al terminar. Además de robots/sitemap, prepara `404.html`. El hosting futuro deberá servir ese archivo con estado 404 para rutas desconocidas, sin reescribirlas a Inicio con estado 200. Hoy no hay despliegue ni cambios de DNS.

## Contacto y assets

El destinatario se configura exclusivamente mediante `CONTACT_TO_EMAIL` en el servidor; el valor solicitado está en `.env.example`. No se expone el correo personal en la web. Los CTAs comerciales llevan a `/contacto` y la guía sigue disponible en `public/consulta-alant.txt`.

El formulario usa Angular Forms **21.2.25**, validación en ambos extremos y gateway separado. Permanece **deshabilitado** sin configuración externa; exige un aviso de privacidad aprobado y consentimiento. Usa Resend, Reply-To validado, idempotencia y límites compartidos en Redis. No simula envíos. Las variables, pasos de Resend/DNS, privacidad y ensayo real están en [docs/CONTACTO-INTEGRACION.md](docs/CONTACTO-INTEGRACION.md). No se añadieron paquetes para el backend: utiliza APIs nativas de Node 24.

Geist Sans y Geist Mono son archivos WOFF2 variables locales, obtenidos de `geist@1.7.2`, bajo SIL Open Font License (`public/fonts/OFL.txt`). El paquete se eliminó después de copiar los archivos para evitar su dependencia de Next.js. Sans se precarga y ambas fuentes usan `font-display: swap`. El wordmark ALANT y el favicon tipográfico son provisionales.

## Validación

Resultados de contacto, límites de validación y pendientes en [docs/ITERACION-6.md](docs/ITERACION-6.md). Se conservan los informes históricos de [iteración 5](docs/ITERACION-5.md), [iteración 4](docs/ITERACION-4.md), [iteración 2](docs/ITERACION-2.md) y [hitos iniciales](docs/QA-HITOS-0-1.md).

Para comprobar el HTML prerenderizado sin scripts de aplicación, `node scripts/preview.mjs --static-only` sirve una variante local en el puerto 4201. Es una ayuda de QA; no modifica el build ni equivale a desactivar todo JavaScript del navegador.

**Revisión antes del lanzamiento:** confirmar integración de formulario, origen de publicación, datos de privacidad y contenido comercial. Los proyectos se incorporarán sólo con material autorizado. No se publicó el sitio.
