/* Escultura «A — Estructura»: estudio de forma, no isotipo aprobado.
   Cada parte es un Mesh independiente con su pose de reposo y su vector de despiece, para que el
   scroll pueda separarla y devolverla a su sitio. Unidades: metros de escena (alto ≈ 2,55). */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export const MEDIDAS = { alto: 2.55, semiluz: 1.3, ancho: 0.44, fondo: 0.46, ranura: 0.024 };

const MINT = new THREE.Color('#97e5b3');

export interface Pose {
  reposo: THREE.Vector3;
  despiece: THREE.Vector3;
  rotDespiece: THREE.Euler;
  capa: number | null;
}

function lienzo(tam: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  return [c, c.getContext('2d')!];
}

function textura(c: HTMLCanvasElement, anisotropia: number): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = anisotropia;
  return t;
}

// Vetas finas en una dirección: rugosidad y relieve del metal cepillado.
function texturaCepillado(tam: number): THREE.CanvasTexture {
  const [c, g] = lienzo(tam);
  g.fillStyle = '#8a8a8a';
  g.fillRect(0, 0, tam, tam);
  for (let i = 0; i < tam * 2.5; i++) {
    const y = Math.random() * tam;
    const v = 110 + Math.random() * 60;
    g.strokeStyle = `rgba(${v},${v},${v},${0.08 + Math.random() * 0.18})`;
    g.lineWidth = Math.random() < 0.9 ? 0.6 : 1.4;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(tam, y + (Math.random() - 0.5) * 3);
    g.stroke();
  }
  return textura(c, 16);
}

function texturaPiedra(tam: number): THREE.CanvasTexture {
  const [c, g] = lienzo(tam);
  g.fillStyle = '#7d7d7d';
  g.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 9000; i++) {
    const v = 90 + Math.random() * 80;
    g.fillStyle = `rgba(${v},${v},${v},0.12)`;
    g.fillRect(Math.random() * tam, Math.random() * tam, 2, 2);
  }
  return textura(c, 4);
}

export function crearMateriales(compacto: boolean) {
  const cepillado = texturaCepillado(compacto ? 1024 : 2048);
  const piedra = texturaPiedra(512);
  const angulo = Math.atan2(MEDIDAS.alto, MEDIDAS.semiluz);
  const titanio = new THREE.MeshPhysicalMaterial({
    name: 'titanio-cepillado',
    color: '#d3d9d9',
    metalness: 1,
    roughness: 0.3,
    roughnessMap: cepillado,
    bumpMap: cepillado,
    bumpScale: 0.25,
    anisotropy: 0.75,
    anisotropyRotation: angulo,
    envMapIntensity: 1.15,
  });
  const grafito = new THREE.MeshPhysicalMaterial({
    name: 'grafito-satinado',
    color: '#4a565a',
    metalness: 1,
    roughness: 0.42,
    roughnessMap: cepillado,
    anisotropy: 0.5,
    anisotropyRotation: -angulo,
    envMapIntensity: 1.1,
  });
  const satinado = new THREE.MeshPhysicalMaterial({
    name: 'acero-satinado',
    color: '#aeb7b6',
    metalness: 1,
    roughness: 0.34,
    envMapIntensity: 0.8,
  });
  const vidrio = new THREE.MeshPhysicalMaterial({
    name: 'vidrio-mint',
    color: '#f1fff6',
    roughness: 0.08,
    transmission: 1,
    thickness: 0.35,
    ior: 1.52,
    attenuationColor: new THREE.Color('#5fcf8d'),
    attenuationDistance: 0.55,
    specularIntensity: 0.6,
    clearcoat: 0.45,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.05,
    transparent: true,
  });
  const vidrioFino = vidrio.clone();
  vidrioFino.name = 'vidrio-estrato';
  Object.assign(vidrioFino, {
    thickness: 0.06,
    attenuationDistance: 1.2,
    roughness: 0.12,
    transmission: 0.96,
    emissiveIntensity: 0.035,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  vidrioFino.color = new THREE.Color('#e9fcef');
  vidrioFino.emissive = new THREE.Color('#97e5b3');
  const piedraMat = new THREE.MeshPhysicalMaterial({
    name: 'piedra-grafito',
    color: '#151d20',
    roughness: 0.42,
    roughnessMap: piedra,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.7,
  });
  // Luz por encima de 1: el pase de brillo selectivo la recoge; no la afecta el tono.
  const luz = new THREE.MeshBasicMaterial({
    name: 'luz-mint',
    color: MINT.clone().multiplyScalar(2.4),
    toneMapped: false,
  });
  // Cantos: líneas con grosor real en píxeles (las de 1 px se ven aserradas).
  const canto = new LineMaterial({
    color: MINT,
    linewidth: 1.6,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return {
    titanio,
    grafito,
    satinado,
    vidrio,
    vidrioFino,
    piedra: piedraMat,
    luz,
    canto,
    texturas: [cepillado, piedra],
  };
}

export type Materiales = ReturnType<typeof crearMateriales>;

const BISEL = {
  bevelEnabled: true,
  bevelThickness: 0.014,
  bevelSize: 0.014,
  bevelSegments: 8,
  curveSegments: 1,
};

// Una pata: paralelogramo con corte horizontal en la base y vertical en el vértice (inglete).
function perfilPata(lado: 1 | -1): THREE.Shape {
  const { alto: H, semiluz: B, ancho: W, ranura } = MEDIDAS;
  const g = ranura / 2 + BISEL.bevelSize;
  const puntos: [number, number][] = [
    [-B, 0],
    [-B + W, 0],
    [-g, (H * (B - W - g)) / B],
    [-g, (H * (B - g)) / B],
  ];
  const p = puntos.map(([x, y]) => new THREE.Vector2(x * lado, y));
  if (lado > 0) p.reverse();
  return new THREE.Shape(p);
}

function extruir(perfil: THREE.Shape, fondo: number): THREE.BufferGeometry {
  const profundidad = fondo - 2 * BISEL.bevelThickness;
  const geo = new THREE.ExtrudeGeometry(perfil, { ...BISEL, depth: profundidad });
  geo.translate(0, 0, -profundidad / 2);
  return geo;
}

// Centra la geometría en su caja: cada pieza gira sobre sí misma.
function centrar(geo: THREE.BufferGeometry): THREE.Vector3 {
  geo.computeBoundingBox();
  const c = new THREE.Vector3();
  geo.boundingBox!.getCenter(c);
  geo.translate(-c.x, -c.y, -c.z);
  return c;
}

const anchoExterior = (y: number) => 2 * (MEDIDAS.semiluz - (MEDIDAS.semiluz / MEDIDAS.alto) * y);

interface OpcionesPieza {
  desplazar?: THREE.Vector3;
  despiece?: THREE.Vector3;
  rotDespiece?: THREE.Euler;
  sombra?: boolean;
  cantos?: boolean;
  capa?: number;
}

export function crearA(mat: Materiales) {
  const { alto: H, fondo: D } = MEDIDAS;
  const grupo = new THREE.Group();
  grupo.name = 'ALANT-A';
  const piezas: THREE.Mesh[] = [];
  const lineas: LineSegments2[] = [];

  const agregar = (
    nombre: string,
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    o: OpcionesPieza = {},
  ) => {
    const centro = centrar(geo);
    const malla = new THREE.Mesh(geo, material);
    malla.name = nombre;
    malla.position.copy(centro).add(o.desplazar ?? new THREE.Vector3());
    malla.castShadow = o.sombra ?? true;
    malla.receiveShadow = true;
    const pose: Pose = {
      reposo: malla.position.clone(),
      despiece: o.despiece ?? new THREE.Vector3(),
      rotDespiece: o.rotDespiece ?? new THREE.Euler(),
      capa: o.capa ?? null,
    };
    malla.userData['pose'] = pose;
    if (o.cantos) {
      const borde = new LineSegments2(
        new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geo, 25)),
        mat.canto,
      );
      borde.scale.setScalar(1.004); // apenas por fuera de las caras: sin pelea de profundidad
      malla.add(borde);
      lineas.push(borde);
    }
    grupo.add(malla);
    piezas.push(malla);
    return malla;
  };

  agregar('pata-izquierda', extruir(perfilPata(-1), D), mat.titanio, {
    despiece: new THREE.Vector3(-0.46, 0.05, -0.08),
    rotDespiece: new THREE.Euler(0, 0.12, 0.05),
  });
  const fondoGrafito = 0.27;
  const fondoVidrio = 0.17;
  const separacion = 0.02;
  agregar('pata-derecha-grafito', extruir(perfilPata(1), fondoGrafito), mat.grafito, {
    desplazar: new THREE.Vector3(0, 0, -D / 2 + fondoGrafito / 2),
    despiece: new THREE.Vector3(0.42, 0.03, -0.32),
    rotDespiece: new THREE.Euler(0, -0.12, -0.04),
  });
  agregar('pata-derecha-vidrio', extruir(perfilPata(1), fondoVidrio - separacion), mat.vidrio, {
    desplazar: new THREE.Vector3(0, 0, D / 2 - fondoVidrio / 2 + separacion / 2),
    despiece: new THREE.Vector3(0.72, 0.06, 0.62),
    rotDespiece: new THREE.Euler(0, -0.22, -0.03),
    sombra: false,
    cantos: true,
  });
  const yRanura = (H * (MEDIDAS.semiluz - MEDIDAS.ancho)) / MEDIDAS.semiluz;
  agregar('hoja-de-luz', new THREE.BoxGeometry(0.012, H - yRanura - 0.06, D * 0.82), mat.luz, {
    desplazar: new THREE.Vector3(0, yRanura + (H - yRanura - 0.06) / 2 + 0.02, 0),
    despiece: new THREE.Vector3(0, 0.42, 0),
    sombra: false,
  });
  const yBarra = 0.92;
  agregar(
    'travesano',
    new RoundedBoxGeometry(anchoExterior(yBarra) - 0.5, 0.11, 0.3, 6, 0.022),
    mat.satinado,
    {
      desplazar: new THREE.Vector3(0, yBarra, -0.02),
      despiece: new THREE.Vector3(0, 0, 0.5),
    },
  );
  [
    { y: 0.38, z: 0.07, recorte: 0.3, abanico: -1 },
    { y: 0.64, z: -0.05, recorte: 0.34, abanico: 0 },
    { y: 1.24, z: 0.05, recorte: 0.3, abanico: 1 },
  ].forEach(({ y, z, recorte, abanico }, i) =>
    agregar(
      `estrato-${i + 1}`,
      new RoundedBoxGeometry(anchoExterior(y) - recorte, 0.026, 0.74, 4, 0.009),
      mat.vidrioFino,
      {
        desplazar: new THREE.Vector3(0, y, z),
        despiece: new THREE.Vector3(0, abanico * 0.22, 0.72 + i * 0.12),
        rotDespiece: new THREE.Euler(0.05 * abanico, 0, 0),
        sombra: false,
        cantos: true,
        capa: abanico,
      },
    ),
  );
  const zocalo = agregar('zocalo', new RoundedBoxGeometry(3.7, 0.07, 1.6, 6, 0.024), mat.piedra, {
    desplazar: new THREE.Vector3(0, -0.035, 0),
    despiece: new THREE.Vector3(0, -0.3, 0),
  });
  const linea = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.004, 0.012), mat.luz);
  linea.name = 'zocalo-linea';
  linea.position.set(0, 0.036, 0.72);
  zocalo.add(linea);

  return { grupo, piezas, lineas };
}
