export interface StoryStage {
  id: string;
  label: string;
  title: string;
  description: string;
  approach: string;
  note: string;
  diagramDescription: string;
  flow: readonly string[];
}

export const STORY_STAGES: readonly StoryStage[] = [
  {
    id: 'solucion-conectar',
    label: $localize`:@@transformation.fragmented:Fragmentación`,
    title: $localize`:@@transformation.fragmentedTitle:Un pedido. Tres cargas de datos.`,
    description: $localize`:@@transformation.fragmentedDescription:La venta llega por la tienda online, el stock está en gestión y el cliente en otra aplicación. Tu equipo copia datos entre ellas.`,
    approach: $localize`:@@transformation.fragmentedApproach:Podemos conectar esas plataformas para compartir pedidos y disponibilidad, sin reemplazar todo lo que usás.`,
    flow: [
      $localize`:@@solutionFlow.store:Tienda online`,
      $localize`:@@solutionFlow.connect:Conexión`,
      $localize`:@@solutionFlow.stock:Stock actualizado`,
    ],
    note: $localize`:@@transformation.fragmentedNote:Información repartida. Tareas que dependen de pasar datos de un sistema a otro.`,
    diagramDescription: $localize`:@@transformation.fragmentedDiagram:Cuatro módulos separados: ecommerce, ERP, CRM y operación. Cada uno conserva sus datos, sin conexiones entre ellos.`,
  },
  {
    id: 'solucion-construir',
    label: $localize`:@@transformation.integration:Integración`,
    title: $localize`:@@transformation.integrationTitle:Del mensaje al sistema, sin transcribir todo.`,
    description: $localize`:@@transformation.integrationDescription:Las solicitudes llegan por email, WhatsApp o documentos. Alguien revisa y carga cada una a mano.`,
    approach: $localize`:@@transformation.integrationApproach:Podemos capturar los datos, validar lo necesario y enviarlos a gestión, con revisión humana para las excepciones.`,
    flow: [
      $localize`:@@solutionFlow.document:Documento`,
      $localize`:@@solutionFlow.validate:Extraer y validar`,
      $localize`:@@solutionFlow.record:Registro`,
    ],
    note: $localize`:@@transformation.integrationNote:Los datos llegan al núcleo, se validan y continúan hacia la operación.`,
    diagramDescription: $localize`:@@transformation.integrationDiagram:Ecommerce, ERP y CRM se alinean como entradas. Sus conexiones convergen en un núcleo de integración y salen hacia operación.`,
  },
  {
    id: 'solucion-automatizar',
    label: $localize`:@@transformation.unified:Sistema unificado`,
    title: $localize`:@@transformation.unifiedTitle:Sabé qué falta, quién lo hace y cómo sigue.`,
    description: $localize`:@@transformation.unifiedDescription:Las tareas y los estados viven en planillas y conversaciones. Para saber cómo va un pedido, hay que preguntar.`,
    approach: $localize`:@@transformation.unifiedApproach:Podemos construir una aplicación interna con responsables, permisos y seguimiento, adaptada a tu forma de trabajar.`,
    flow: [
      $localize`:@@solutionFlow.sheets:Planillas`,
      $localize`:@@solutionFlow.app:Sistema propio`,
      $localize`:@@solutionFlow.followup:Seguimiento`,
    ],
    note: $localize`:@@transformation.unifiedNote:Datos compartidos, revisión humana y registro del proceso dentro de una misma plataforma.`,
    diagramDescription: $localize`:@@transformation.unifiedDiagram:Los mismos módulos se reorganizan dentro de una plataforma integrada, alrededor del núcleo. El flujo termina con datos compartidos, revisión humana y un registro consultable.`,
  },
];
