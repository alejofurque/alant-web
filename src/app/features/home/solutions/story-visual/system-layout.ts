export interface ModulePose {
  x: number;
  y: number;
  rotation: number;
}
export type SystemState = 0 | 1 | 2;

// Coordinates use percentages. The same module identities persist through all three states.
// Order: ecommerce, ERP, CRM, operation, core.
export const SYSTEM_LAYOUTS: readonly (readonly ModulePose[])[] = [
  [
    { x: 70, y: 18, rotation: 7 },
    { x: 24, y: 35, rotation: -7 },
    { x: 76, y: 66, rotation: 6 },
    { x: 27, y: 84, rotation: -5 },
    { x: 52, y: 50, rotation: 0 },
  ],
  [
    { x: 19, y: 23, rotation: 0 },
    { x: 19, y: 50, rotation: 0 },
    { x: 19, y: 77, rotation: 0 },
    { x: 84, y: 50, rotation: 0 },
    { x: 53, y: 50, rotation: 0 },
  ],
  [
    { x: 26, y: 22, rotation: 0 },
    { x: 74, y: 22, rotation: 0 },
    { x: 26, y: 78, rotation: 0 },
    { x: 74, y: 78, rotation: 0 },
    { x: 50, y: 50, rotation: 0 },
  ],
];

export const SYSTEM_MODULES = [
  {
    id: 'ecommerce',
    code: '01',
    title: $localize`:@@solutions.ecommerce:Ecommerce`,
    detail: $localize`:@@living.orders:Pedidos`,
  },
  { id: 'erp', code: '02', title: 'ERP', detail: $localize`:@@living.stock:Stock` },
  { id: 'crm', code: '03', title: 'CRM', detail: $localize`:@@diagram.customers:Clientes` },
  {
    id: 'operation',
    code: '04',
    title: $localize`:@@diagram.operation:Operación`,
    detail: $localize`:@@living.tasks:Tareas`,
  },
  {
    id: 'core',
    code: 'API / CORE',
    title: $localize`:@@living.core:Núcleo`,
    detail: $localize`:@@living.validation:Validación`,
  },
] as const;

const EDGES = [
  [0, 4],
  [1, 4],
  [2, 4],
  [4, 3],
] as const;

export function connectionPaths(state: SystemState): string[] {
  const positions = SYSTEM_LAYOUTS[state];
  return EDGES.map(([source, target]) => {
    const from = positions[source],
      to = positions[target];
    const x1 = from.x * 10,
      y1 = from.y * 8;
    const x2 = to.x * 10,
      y2 = to.y * 8;
    const middle = (x1 + x2) / 2;
    // Matching SVG commands let GSAP interpolate the geometry without a morphing plugin.
    return `M${x1} ${y1}C${middle} ${y1} ${middle} ${y2} ${x2} ${y2}`;
  });
}
