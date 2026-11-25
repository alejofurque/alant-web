# ALANT — dos propuestas de product storytelling

Entrega estática para aprobación visual. Revisión final: 27 de octubre de 2026. No se integró ninguna propuesta a las páginas corporativas y no se modificó contacto, backend, variables ni despliegues.

## Abrir y comparar

- **A / Panorama:** http://127.0.0.1:4301/?concepto=a
- **B / Recorrido:** http://127.0.0.1:4301/?concepto=b

Ambas incluyen hero, tres servicios con interfaces originales, proceso, cierre comercial y footer. El selector superior permite alternarlas. Los CTA abren el contacto actual de ALANT; las interfaces ilustradas son estáticas y están identificadas como ejemplos conceptuales. Todos los datos son ficticios.

Si el servidor local se cerró, ejecutar desde la raíz del repositorio:

```powershell
& 'C:\Program Files\nodejs\node.exe' node_modules/@angular/cli/bin/ng.js build product-story
& 'C:\Program Files\nodejs\node.exe' labs/product-story/serve.mjs
```

Sirve únicamente `dist/product-story/browser` en loopback, puerto 4301. No incluye API ni conexión a servicios externos. No modifica el proceso del puerto 4200.

## A / Panorama — recomendada

**Mensaje:** «Software a medida. Operación a la vista.»

El hero oscuro contrasta con una aplicación clara de gran formato. Se reconoce el trabajo concreto: un pedido, sus artículos, cliente, importe y stock reservado. La presentación de servicios amplía ese mismo ejemplo con preparación de pedidos, registro en ERP y revisión documental. La composición pone la capacidad de construir software en primer plano.

**Animación propuesta, sin implementar:** llega el pedido #1048 al listado; se abre su detalle, se reservan las cantidades y la preparación confirma sus artículos. Una secuencia única de aproximadamente 5 segundos dentro de la pantalla, con botón de repetición. Título y CTA siempre visibles. Estado final estático con movimiento reducido. Sin pinning ni scroll obligatorio.

## B / Recorrido

**Mensaje:** «Construimos el software que tu empresa necesita.»

Hero claro con una orden de compra y el registro resultante superpuesto. Los servicios forman tres capítulos, con cambios de superficie y escala: gestionar, conectar y automatizar. Es una lectura más narrativa, con mayor espacio para explicar la aplicación empresarial de cada servicio.

**Animación propuesta, sin implementar:** el documento del hero muestra cómo sus campos se reconocen y pasan al registro. La fecha «viernes» detiene el proceso con una solicitud visible de revisión; solo tras una confirmación ilustrativa se presenta el registro completo. Una secuencia de 6–7 segundos iniciada por el visitante, sin bucle, con estado accesible resumido y alternativa estática. Nada de partículas, conexiones abstractas ni movimiento del copy.

**Recomendación:** A como punto de partida por la claridad inmediata del producto y su afinidad con Precision Mint. B si se prefiere priorizar el relato de una operación. Es una valoración de diseño; no se realizó un test de cinco segundos con usuarios externos.

## Capturas reales del navegador

Se capturó el build optimizado, no renders generados por IA. Viewports: escritorio 1440 × 1000, tablet 768 × 1024 y móvil 390 × 844. Chromium integrado en Windows; no prueba en dispositivo físico. La barra de scroll puede descontar 15 px del ancho útil de las capturas completas.

| Propuesta | Escritorio completo | Móvil completo | Tablet completa |
|---|---|---|---|
| A | [Captura](a-desktop-full.jpg) | [Captura](a-mobile-full.jpg) | [Captura](a-tablet-full.jpg) |
| B | [Captura](b-desktop-full.jpg) | [Captura](b-mobile-full.jpg) | [Captura](b-tablet-full.jpg) |

Además: `a-desktop-hero.jpg`, `b-desktop-hero.jpg`, `a-mobile-hero.jpg`, `b-mobile-hero.jpg`.

## Validaciones

- `ng build product-story`: correcto. 292,64 kB iniciales, 56,03 kB de transferencia estimada por Angular, sin contar fuentes. JS `main-F6I7YN35.js`, CSS `styles-ZYL4XZQX.css`. Sin paquetes adicionales ni GSAP en este laboratorio.
- `ng test alant-web --watch=false`: **33 pruebas correctas / 11 archivos**. Son pruebas existentes de la aplicación, no una certificación visual de las propuestas.
- Prettier sobre `labs/product-story` y `angular.json`: correcto.
- `git diff --check`: sin errores de whitespace; Git avisa sobre normalización LF/CRLF.
- A y B: sin overflow horizontal en 390, 768 y 1440 px; un H1 por página; destinos de anclas presentes; query de la propuesta conservada al navegar por secciones.
- Verificados visualmente el hero, servicios, ERP, documento y revisión humana. En móvil se apilan los detalles y se prioriza el pedido activo en el panel.
- Comprobados Tab, foco visible e ingreso al contenido mediante Enter. No se realizó auditoría integral WCAG ni prueba con lector de pantalla.
- Sin errores ni warnings en la consola capturada durante la revisión.
- Se corrigieron saltos de línea que unían palabras en tablet y se compactaron los titulares móviles para adelantar el producto.
- Las escenas no tienen animaciones ni dependencias de scroll; el estado estático sirve también para movimiento reducido.
- No se ejecutó Lighthouse en esta entrega. Los tamaños de bundle no representan métricas medidas de rendimiento o CLS.

## Archivos de esta entrega

- `angular.json`: nuevo proyecto aislado `product-story`; se preservó el laboratorio anterior.
- `labs/product-story/`: arranque Angular, plantillas de ambas páginas, cuatro componentes de interfaz ilustrativa, estilos propios, servidor local y dirección de diseño.
- `docs/qa/product-story/`: informe y capturas.

Los cambios pendientes que ya existían en `src/`, `scripts/check-build.mjs` y los laboratorios anteriores se conservaron; no pertenecen a esta entrega. No hubo commit, push ni publicación.

## Referencias y guías

Se estudiaron directamente las guías oficiales de [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) y [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), más su guía rápida de calidad. No estaban instaladas localmente; no se ejecutó su buscador de patrones.

Se inspeccionaron visualmente [Linear](https://linear.app/), [Attio](https://attio.com/) y [n8n](https://n8n.io/) para estudiar escala de pantallas, detalles superpuestos y relatos de tareas. Algunas piezas de vídeo de n8n no pudieron reproducirse. No se copiaron assets, capturas, logos, colores ni textos. El razonamiento de composición y el modelo de datos están en [DESIGN.md](../../../labs/product-story/DESIGN.md).

**Siguiente paso:** elegir y aprobar una propuesta estática antes de integrar o animar.
