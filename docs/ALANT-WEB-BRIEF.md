# ALANT — Brief de marca y web (v1.0)

## 1. Identidad estratégica
**Nombre:** ALANT (nombre de trabajo elegido; revisión marcaria pendiente).
**Categoría pública:** Software Engineering Studio.
**Mercado inicial:** Argentina, especialmente Córdoba; diseño escalable a LATAM, España y clientes internacionales.
**Cliente principal:** PyMEs y empresas medianas que necesitan sistemas propios, modernizar operaciones o conectar plataformas. También startups/SaaS con necesidades técnicas concretas.
**Posicionamiento:** estudio boutique de ingeniería que diseña, construye e integra software para resolver problemas operativos reales.
**Atributos:** ingeniería, precisión, confianza, sofisticación, pragmatismo, modernidad, responsabilidad técnica.
**No somos:** agencia de marketing, creador de chatbots, agencia n8n, software factory genérica, consultora sobredimensionada.

### Mensaje núcleo (no es slogan aprobado)
> Diseñamos, construimos e integramos software alrededor de cómo funciona cada empresa.

### Servicios públicos principales
1. **Software Engineering:** software a medida, plataformas web, herramientas internas, dashboards, productos digitales, MVPs y evolución de software.
2. **Systems Integration:** APIs, ERP, CRM, WhatsApp, pagos, ecommerce, webhooks, sincronización de datos, integraciones entre sistemas.
3. **AI & Automation:** automatización operativa, flujos de documentos/mensajes, IA aplicada, agentes empresariales donde aporten valor, supervisión y control.

Servicios complementarios: mantenimiento, soporte, infraestructura y evolución. Desarrollo web corporativo puede ofrecerse, pero **no** debe liderar el posicionamiento ni dar apariencia de agencia de páginas baratas.

## 2. Identidad visual aprobada
**Dirección:** Engineered Systems.
**Propuesta:** 01 — Precision Mint.
**Subdirección:** Structural Precision (base) + Technical Signal (distinción), con System Motion sutil cuando sea útil.

### Paleta oficial inicial (tokens, ajustables solo por contrastes/accesibilidad)
| Token | Hex | Uso |
|---|---|---|
| graphite | `#11191B` | base oscura, headers, superficies |
| offwhite | `#F2F4F1` | base clara, textos sobre oscuro |
| mint | `#97E5B3` | acento, indicadores, enlaces o CTA contrastados |
| slate | `#65787C` | detalles y elementos neutros |

Se pueden añadir neutrales derivados: `#202C2F` superficies, `#334247` bordes oscuros, `#BBC9C8` texto secundario sobre fondo oscuro, siempre verificando WCAG. No usar mint como texto pequeño sobre blanco: contrastar antes.

### Tipografía candidata
- **Geist Sans:** headings, párrafos y UI (utilizar conforme a licencia).
- **Geist Mono:** microetiquetas, números, tags, labels técnicos.
- Fallbacks sans-serif y monospace adecuados.
- No usar monospace para todos los párrafos.

### Lenguaje gráfico
- Retícula de 12 columnas para desktop, grillas responsive.
- Paneles y módulos de aristas precisas, esquinas ligeramente redondeadas.
- Divisores delgados, líneas de alineación, bloques bien estructurados.
- Microetiquetas como `01 / SOFTWARE ENGINEERING`, indicadores y códigos técnicos muy discretos.
- Diagramas de sistemas reales/abstractos: entradas, procesos, validación, salida, integraciones. Evitar líneas aleatorias sin significado.
- Equilibrio entre fondos graphite y superficies claras offwhite; espacios generosos.
- Usar el moodboard adjunto para nivel de calidad/composición, **no** copiarlo literalmente como screenshot.

### Evitar
Robots, chips, cerebros, circuitos, cohetes, hexágonos tech obvios, neón gamer, degradados violeta, fondos llenos de partículas y exceso de animación.

## 3. Objetivo de la web
**Objetivo comercial:** que una empresa entienda en segundos qué resuelve ALANT y solicite una conversación sobre su necesidad.
**CTA principal:** “Hablemos de tu proyecto”.
**CTA secundario:** “Explorar servicios”.
**Prueba de capacidad:** visualizaciones funcionales y demostraciones auténticas; no inventar clientes ni resultados.
**No optimizar por:** aparentar una empresa gigante, acumular contenido o efectos visuales pesados.

## 4. Arquitectura final deseada
- `/` — Inicio (se construye PRIMERO)
- `/servicios` — Servicios
- `/proyectos` — Proyectos y demos (distinguir demos conceptuales de casos reales)
- `/estudio` — Estudio
- `/contacto` — Contacto

Crear las rutas posteriores en fases siguientes. En la primera homepage, la navegación debe funcionar: puede usarse navegación a secciones internas hasta que haya páginas reales. No publicar links rotos.

## 5. Blueprint homepage — contenido de trabajo
**Nota:** los textos son propuestas iniciales editables, no claims verificados; cuidar concreción y brevedad.

### Header
Wordmark tipográfico «ALANT». Nav: Servicios, Soluciones/Demos, Estudio, Contacto. CTA: “Hablemos”. Sticky discreto, menú móvil accesible.

### Hero
Eyebrow: `SOFTWARE ENGINEERING STUDIO`
Título candidato: **“Software bien construido. Operaciones que avanzan.”**
Subtítulo candidato: “Diseñamos, desarrollamos e integramos sistemas a medida para resolver desafíos reales de tu empresa. Sumamos automatización e inteligencia artificial cuando aportan valor.”
CTA primaria: “Hablemos de tu proyecto”. CTA secundaria: “Explorar servicios”.
Visual central: diagrama de integración o paneles modularizados con flujo `Sistema / API / Validación / Operación`, de alta calidad tipográfica y técnica, no dashboard falso con cifras.

### Franja de capacidades
`SOFTWARE ENGINEERING / SYSTEMS INTEGRATION / AI & AUTOMATION`

### Servicios
Tres bloques principales con una frase concreta por servicio; permitir reconocer ejemplos reales de necesidades sin prometer capacidades no verificadas.

### Cómo trabajamos
`01 / Entender` diagnóstico del problema y contexto.
`02 / Diseñar` arquitectura y alcance claros.
`03 / Construir` software mantenible y probado.
`04 / Evolucionar` soporte e iteración.
Sin afirmar certificaciones o metodologías particulares que no estén confirmadas.

### Problemas que resolvemos (ejemplos ilustrativos, no casos de clientes)
- Sistemas que no comparten datos.
- Trabajo manual repetitivo entre aplicaciones, archivos y mensajes.
- Procesos que requieren una herramienta propia.
- Soluciones existentes que ya no acompañan la operación.
- Incorporación controlada de IA dentro de flujos empresariales.

### Cierre comercial
Título candidato: “Conversemos sobre lo que necesitás construir.”
CTA a contacto real disponible (puede ser `mailto:` temporal si se configura email confirmado por el fundador; **no inventar uno**).

### Footer
ALANT · Software Engineering Studio. Links funcionales. Datos legales y sociales solo si están disponibles/confirmados.

## 6. Escritura y tono
- Español profesional, concreto y natural; evitar localismos fuertes, exageración y humo.
- No usar “Revolucionamos tu negocio” ni “te llevamos al siguiente nivel”.
- Explicar el problema y resultado potencial sin fabricar cifras.
- Mostrar capacidad mediante productos/demos y pensamiento técnico.
- Mantener longitudes de texto realistas para diseño responsive.

## 7. SEO e idiomas
- Idioma fuente español neutro (`es`).
- Preparar Angular i18n nativo (`@angular/localize`) para versión inglesa (`en`) futura; no publicar versión inglés vacía o simulada.
- Diseñar estrategia de URLs localizadas; inicialmente `/` español. Más adelante `/en/` para inglés.
- Titles, descriptions, canonical, Open Graph, sitemap y robots coherentes con rutas reales.
- Solo generar `hreflang` cuando existan URLs realmente publicadas para ambos idiomas.
- Priorizar páginas HTML prerenderizadas y metadatos correctos por ruta.

## 8. Experiencia/QA
- Excelente legibilidad en móvil 360px y escritorio 1440px; probar tamaños intermedios.
- Navegación por teclado, foco visible, contraste accesible, etiquetas semánticas, estados hover/focus.
- Performance: assets optimizados, fuentes cargadas responsablemente, animaciones discretas con `prefers-reduced-motion`.
- Imágenes de referencia no se usarán como background del sitio.
- Validar CTA real, enlaces, title/meta, sin errores console, sin overflow horizontal.

## 9. Pendientes reales
- Contacto/email o calendario oficial para CTA.
- Portfolio o demos verificables.
- Logo definitivo (por ahora wordmark).
- Revisión legal del nombre ALANT por coincidencia comercial en Brasil.
- Dominio actual `alantapp.com` es propiedad del fundador; uso/publicación posterior, sin modificar DNS ahora.
