# Hero con la escultura 3D «A — Estructura»

Fecha: 27/11/2026. Estudio de forma, no isotipo aprobado: la marca sigue usando el wordmark «ALANT».

## Qué cambió

- **Hero:** ahora es una sección propia. A la izquierda, el texto, el CTA y «¿Qué necesitás?»; a la derecha, la escultura 3D (9 piezas: titanio cepillado, grafito, vidrio mint, acero satinado y piedra).
- **Movimiento:** al bajar, la pieza se desarma y gira; sigue al puntero en escritorio y se pausa fuera de pantalla.
- **Escenario de planos:** queda en los servicios, donde explica los productos. En pantallas angostas se oculta y cada servicio muestra su plano en línea.
- **Titular:** pasa a dos líneas en todos los anchos (tope de 74 px).

## Cómo carga (rendimiento)

| Etapa | Qué se ve |
| --- | --- |
| HTML prerenderizado | Imagen fija de la misma pieza (WebP con transparencia, en 600, 800 y 1200 px) |
| Primer gesto real (mover el mouse, tocar, rueda, teclado) | Se descarga Three.js en un chunk aparte (133 kB comprimido) y se monta la escena |
| Montaje | En etapas cortas y con los shaders compilados en paralelo, sin bloquear la página |
| Movimiento reducido | La imagen fija queda y no se descarga nada |
| Sin WebGL2 o si falla | La imagen fija queda y no se descarga nada |

**Hallazgos durante la QA**

- Sondear WebGL2 al hidratar (crear un contexto de prueba) bloqueaba el hilo principal unos 570 ms. Se eliminó: si no hay WebGL2, el montaje falla y queda la imagen.
- Disparar la carga con el evento `scroll` o «al quedar libre» metía Three.js en la medición inicial. Ahora solo la disparan gestos del usuario.
- El lienzo es transparente y se compone sobre el fondo del sitio. El tono AgX y el brillo se aplican de forma que no aclaran el fondo; se verificó píxel a píxel que el borde del lienzo coincide con el fondo.
- `check-build` comprueba que Three.js no se cargue con el HTML inicial y que existan las imágenes fijas.

## Lighthouse (home, build local servido con gzip)

| Versión | Móvil (rend.) | LCP móvil | TBT móvil | Escritorio (rend.) | A11y / BP / SEO | CLS |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| Anterior (sin escultura) | 88-89 | 3,2-3,4 s | 70-80 ms | — | 100 / 100 / 100 | 0 |
| Nueva | 85-86 (una corrida 78) | 3,7 s | 85-120 ms | 99 | 100 / 100 / 100 | 0 |

**Lectura:** en móvil el costo es de unos 3 o 4 puntos, porque el LCP pasa a ser la imagen de la escultura. En escritorio queda en 99.

**Fluidez:** en la RX 5500 XT la escena llega al tope de cuadros del navegador, y la resolución baja sola en equipos lentos.

## Material

- `escritorio-hero.jpg`, `escritorio-desarme.jpg`, `movil.jpg` (imagen fija, 3D tras el gesto y servicios).
- `scripts/qa/poster-escultura.mjs` regenera la imagen fija desde la escena real si cambia la pieza.
