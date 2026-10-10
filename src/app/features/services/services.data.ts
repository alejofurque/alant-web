export const SERVICE_DETAILS = [
  {
    id: 'software',
    number: '01',
    name: 'Software Engineering',
    title: $localize`:@@services.software.title:Software alrededor de tu operación.`,
    problem: $localize`:@@services.software.problem:Cuando las planillas, las tareas manuales o una herramienta rígida ya no acompañan la forma de trabajar, hace falta un sistema propio.`,
    offer: $localize`:@@services.software.offer:Diseñamos y desarrollamos software empresarial a medida. Partimos de los procesos, los usuarios y las reglas del negocio para definir una herramienta que tenga sentido en el uso diario.`,
    capabilities: [
      $localize`:@@services.software.cap1:Software empresarial a medida`,
      $localize`:@@services.software.cap2:Aplicaciones y plataformas web`,
      $localize`:@@services.software.cap3:Sistemas internos`,
      $localize`:@@services.software.cap4:Dashboards y paneles administrativos`,
      $localize`:@@services.software.cap5:MVPs y productos digitales`,
      $localize`:@@services.software.cap6:Modernización de sistemas`,
    ],
    examples: [
      {
        title: $localize`:@@services.software.ex1.title:Una operación, una herramienta`,
        text: $localize`:@@services.software.ex1.text:Un sistema interno para gestionar solicitudes, responsables y aprobaciones, con permisos acordes a cada rol.`,
      },
      {
        title: $localize`:@@services.software.ex2.title:Información para decidir`,
        text: $localize`:@@services.software.ex2.text:Un panel que reúne estados de pedidos y tareas pendientes para que el equipo pueda identificar qué requiere atención.`,
      },
      {
        title: $localize`:@@services.software.ex3.title:Una base para el producto`,
        text: $localize`:@@services.software.ex3.text:Un MVP con un alcance definido para validar el uso, aprender y decidir las siguientes etapas de desarrollo.`,
      },
    ],
    benefit: $localize`:@@services.software.benefit:El objetivo: procesos visibles, menos dependencias de archivos dispersos y una base mantenible para evolucionar.`,
    steps: [
      $localize`:@@services.software.flow1:Proceso`,
      $localize`:@@services.software.flow2:Sistema propio`,
      $localize`:@@services.software.flow3:Operación`,
    ],
  },
  {
    id: 'integraciones',
    number: '02',
    name: 'Systems Integration',
    title: $localize`:@@services.integration.title:Tus sistemas, trabajando en conjunto.`,
    problem: $localize`:@@services.integration.problem:Un pedido no debería obligar a volver a cargar los mismos datos en cada aplicación. Cuando los sistemas están separados, también lo está la información.`,
    offer: $localize`:@@services.integration.offer:Conectamos plataformas existentes mediante APIs y procesos de integración. Definimos qué información circula, cuál es su fuente y cómo se detectan y resuelven los errores.`,
    capabilities: [
      $localize`:@@services.integration.cap1:Integraciones de APIs`,
      $localize`:@@services.integration.cap2:ERP y CRM`,
      $localize`:@@services.integration.cap3:Ecommerce y sistemas empresariales`,
      $localize`:@@services.integration.cap4:Pasarelas de pago`,
      $localize`:@@services.integration.cap5:Sincronización de información`,
      $localize`:@@services.integration.cap6:Webhooks y procesos entre aplicaciones`,
    ],
    examples: [
      {
        title: $localize`:@@services.integration.ex1.title:Del pedido a la operación`,
        text: $localize`:@@services.integration.ex1.text:Conectar ecommerce y ERP para intercambiar pedidos y disponibilidad de productos, según las reglas del negocio.`,
      },
      {
        title: $localize`:@@services.integration.ex2.title:Un estado de pago confiable`,
        text: $localize`:@@services.integration.ex2.text:Recibir eventos de una pasarela, validar su origen y actualizar el pedido sin procesar dos veces una notificación.`,
      },
      {
        title: $localize`:@@services.integration.ex3.title:Continuidad comercial`,
        text: $localize`:@@services.integration.ex3.text:Relacionar el CRM con un sistema interno para acompañar una oportunidad desde su registro hasta la entrega.`,
      },
    ],
    benefit: $localize`:@@services.integration.benefit:El objetivo: información consistente, menos carga duplicada y trazabilidad cuando un intercambio necesita revisión.`,
    steps: [
      $localize`:@@services.integration.flow1:Sistemas`,
      $localize`:@@services.integration.flow2:API + reglas`,
      $localize`:@@services.integration.flow3:Datos conectados`,
    ],
  },
  {
    id: 'automatizacion',
    number: '03',
    name: 'AI & Automation',
    title: $localize`:@@services.automation.title:Automatizar con contexto y control.`,
    problem: $localize`:@@services.automation.problem:Clasificar documentos, copiar información o coordinar tareas repetitivas consume atención. Algunas decisiones, en cambio, necesitan seguir en manos del equipo.`,
    offer: $localize`:@@services.automation.offer:Diseñamos automatizaciones e integramos IA cuando aporta valor al proceso. Definimos sus límites, los datos que puede utilizar y los puntos de revisión humana antes de incorporarla a la operación.`,
    capabilities: [
      $localize`:@@services.automation.cap1:Automatización de procesos`,
      $localize`:@@services.automation.cap2:Agentes de IA empresariales`,
      $localize`:@@services.automation.cap3:Procesamiento inteligente de documentos`,
      $localize`:@@services.automation.cap4:Automatización comercial y administrativa`,
      $localize`:@@services.automation.cap5:IA en software existente`,
      $localize`:@@services.automation.cap6:Workflows inteligentes`,
    ],
    examples: [
      {
        title: $localize`:@@services.automation.ex1.title:Documentos listos para revisar`,
        text: $localize`:@@services.automation.ex1.text:Extraer datos de documentos, contrastarlos con reglas y derivar las inconsistencias a una persona antes de registrarlos.`,
      },
      {
        title: $localize`:@@services.automation.ex2.title:Tareas que encuentran su destino`,
        text: $localize`:@@services.automation.ex2.text:Clasificar solicitudes, proponer una prioridad y asignarlas al circuito administrativo correspondiente.`,
      },
      {
        title: $localize`:@@services.automation.ex3.title:Asistencia dentro del sistema`,
        text: $localize`:@@services.automation.ex3.text:Un agente que consulta información autorizada y prepara acciones, con aprobación humana para las operaciones sensibles.`,
      },
    ],
    benefit: $localize`:@@services.automation.benefit:El objetivo: reducir trabajo repetitivo, hacer visibles las excepciones y conservar control sobre las decisiones.`,
    steps: [
      $localize`:@@services.automation.flow1:Información`,
      $localize`:@@services.automation.flow2:IA + revisión`,
      $localize`:@@services.automation.flow3:Acción`,
    ],
  },
] as const;
