export interface StoryStage {
  id: string;
  label: string;
  title: string;
  description: string;
  approach: string;
  note: string;
  diagramDescription: string;
}

export const STORY_STAGES: readonly StoryStage[] = [
  {
    id: 'solucion-conectar',
    label: $localize`:@@transformation.fragmented:Fragmentación`,
    title: $localize`:@@transformation.fragmentedTitle:Cada sistema tiene una parte de la historia.`,
    description: $localize`:@@transformation.fragmentedDescription:El pedido llega por el ecommerce, el stock está en el ERP y los clientes están en el CRM. El equipo vuelve a cargar datos para poder avanzar.`,
    approach: $localize`:@@transformation.fragmentedApproach:Primero entendemos dónde nace la información, quién la necesita y qué decisiones siguen dependiendo de una persona.`,
    note: $localize`:@@transformation.fragmentedNote:Información repartida. Tareas que dependen de pasar datos de un sistema a otro.`,
    diagramDescription: $localize`:@@transformation.fragmentedDiagram:Cuatro módulos separados: ecommerce, ERP, CRM y operación. Cada uno conserva sus datos, sin conexiones entre ellos.`,
  },
  {
    id: 'solucion-construir',
    label: $localize`:@@transformation.integration:Integración`,
    title: $localize`:@@transformation.integrationTitle:Una arquitectura conecta las piezas.`,
    description: $localize`:@@transformation.integrationDescription:Los sistemas existentes pueden trabajar juntos. Una capa de integración recibe los datos, aplica reglas y los entrega a la operación.`,
    approach: $localize`:@@transformation.integrationApproach:Definimos contratos entre sistemas, validaciones y manejo de errores. El flujo gana continuidad sin perder el control sobre cada paso.`,
    note: $localize`:@@transformation.integrationNote:Los datos llegan al núcleo, se validan y continúan hacia la operación.`,
    diagramDescription: $localize`:@@transformation.integrationDiagram:Ecommerce, ERP y CRM se alinean como entradas. Sus conexiones convergen en un núcleo de integración y salen hacia operación.`,
  },
  {
    id: 'solucion-automatizar',
    label: $localize`:@@transformation.unified:Sistema unificado`,
    title: $localize`:@@transformation.unifiedTitle:Una operación compartida. Un sistema propio.`,
    description: $localize`:@@transformation.unifiedDescription:Una herramienta interna puede reunir pedidos, responsables y estados. Los procesos conectados dejan un registro que el equipo puede consultar.`,
    approach: $localize`:@@transformation.unifiedApproach:Construimos la plataforma alrededor de la operación. Automatizamos tareas repetitivas y mantenemos la revisión humana donde hace falta decidir.`,
    note: $localize`:@@transformation.unifiedNote:Datos compartidos, revisión humana y registro del proceso dentro de una misma plataforma.`,
    diagramDescription: $localize`:@@transformation.unifiedDiagram:Los mismos módulos se reorganizan dentro de una plataforma integrada, alrededor del núcleo. El flujo termina con datos compartidos, revisión humana y un registro consultable.`,
  },
];
