/* Escena 3D de la escultura para el hero. Se carga en un chunk aparte y solo en el navegador.
   El lienzo es transparente: la pieza, su reflejo y su sombra se componen sobre el fondo del sitio,
   y el brillo de las luces mint se suma encima. Solo brillan las piezas en la capa LUZ. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { crearA, crearMateriales, MEDIDAS, Pose } from './modelo-a';

export interface Escultura {
  /** 0 = hero en pantalla; 1 = hero fuera. Separa las piezas al salir. */
  progreso(valor: number): void;
  puntero(x: number, y: number): void;
  pausar(pausada: boolean): void;
  medir(ancho: number, alto: number): void;
  destruir(): void;
}

export interface OpcionesEscultura {
  compacto: boolean;
  quieto: boolean;
}

const LUZ = 1;

// Cede el hilo principal entre etapas: el montaje no forma una sola tarea larga.
const ceder = () => new Promise<void>((ok) => setTimeout(ok, 0));

export async function montarEscultura(
  lienzo: HTMLCanvasElement,
  op: OpcionesEscultura,
): Promise<Escultura> {
  const renderer = new THREE.WebGLRenderer({
    canvas: lienzo,
    antialias: false, // con postproceso el suavizado lo da el MSAA del composer
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  /* Entorno de estudio: difusores y tiras finas, horneados en un mapa de reflejos. */
  const estudio = new THREE.Scene();
  estudio.background = new THREE.Color('#161c1f');
  const panel = (
    w: number,
    h: number,
    color: string,
    k: number,
    pos: [number, number, number],
    mira: [number, number, number],
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(k),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(...pos);
    m.lookAt(...mira);
    estudio.add(m);
  };
  panel(10, 3.4, '#ffffff', 1.8, [0, 6, 1.5], [0, 0, 0]);
  panel(0.32, 9, '#ffffff', 9, [-5, 2.5, 3.2], [0, 1, 0]);
  panel(0.26, 9, '#eef4ff', 6, [5.4, 2.5, 2.2], [0, 1, 0]);
  panel(9, 0.22, '#ffffff', 7, [0, 5.2, -4], [0, 1, 0]);
  panel(7, 3.5, '#ffffff', 1.7, [0.5, 4.6, 6.5], [0, 1.2, 0]);
  panel(0.35, 7, '#ffffff', 6, [-2.6, 2.4, 6.8], [0, 1.2, 0]);
  panel(0.25, 7, '#eef4ff', 4, [2.8, 2.4, 6.4], [0, 1.2, 0]);
  panel(5, 2.5, '#97e5b3', 2.6, [-4, 4, -5], [0, 1, 0]);
  panel(8, 0.6, '#ffffff', 1.3, [0, 0.6, 7], [0, 1, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(estudio, 0.035).texture;
  pmrem.dispose();
  estudio.traverse(
    (o) =>
      o instanceof THREE.Mesh && (o.geometry.dispose(), (o.material as THREE.Material).dispose()),
  );
  await ceder();
  escena.environment = entorno;
  escena.environmentIntensity = 1.3;

  const clave = new THREE.DirectionalLight('#ffffff', 1.1);
  clave.position.set(-5.5, 7, 1.2);
  clave.castShadow = true;
  clave.shadow.mapSize.set(op.compacto ? 1024 : 2048, op.compacto ? 1024 : 2048);
  Object.assign(clave.shadow.camera, {
    left: -3,
    right: 3,
    top: 3.5,
    bottom: -1.5,
    near: 1,
    far: 16,
  });
  clave.shadow.bias = -0.0002;
  clave.shadow.normalBias = 0.015;
  clave.shadow.radius = 10;
  clave.shadow.blurSamples = 20;
  escena.add(clave);
  const contraluz = new THREE.DirectionalLight('#97e5b3', 2.4);
  contraluz.position.set(-4, 3, -5);
  escena.add(contraluz);
  escena.add(new THREE.HemisphereLight('#cfe9ff', '#0b1113', 0.35));

  /* Piso: reflejo real (solo escritorio), velo de piedra y sombra, que se apagan con la distancia. */
  const reflejo = op.compacto
    ? null
    : new Reflector(new THREE.PlaneGeometry(14, 14), {
        shader: {
          name: 'ReflejoConFundido',
          uniforms: {
            color: { value: null },
            tDiffuse: { value: null },
            textureMatrix: { value: null },
          },
          vertexShader: /* glsl */ `
            uniform mat4 textureMatrix;
            varying vec4 vUv;
            varying vec2 vPlano;
            void main() {
              vUv = textureMatrix * vec4(position, 1.0);
              vPlano = position.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            uniform vec3 color;
            uniform sampler2D tDiffuse;
            varying vec4 vUv;
            varying vec2 vPlano;
            void main() {
              vec4 r = texture2DProj(tDiffuse, vUv);
              float f = (1.0 - smoothstep(0.8, 4.2, length(vPlano * vec2(0.8, 1.15)))) * 0.3;
              gl_FragColor = vec4(r.rgb * color * f, r.a * f);
            }`,
        },
        color: '#b7c2c0',
        textureWidth: 1024,
        textureHeight: 1024,
        multisample: 4,
      });
  if (reflejo) {
    const m = reflejo.material as THREE.ShaderMaterial;
    m.transparent = true;
    m.depthWrite = false;
    m.premultipliedAlpha = true;
    reflejo.rotation.x = -Math.PI / 2;
    reflejo.position.y = -0.0712;
    escena.add(reflejo);
  }
  const mascara = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    r.addColorStop(0, '#fff');
    r.addColorStop(0.5, '#777');
    r.addColorStop(1, '#000');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const velo = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshPhysicalMaterial({
      color: '#070c0d',
      roughness: 0.38,
      metalness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.55,
      alphaMap: mascara,
      envMapIntensity: 0.45,
      depthWrite: false,
    }),
  );
  velo.rotation.x = -Math.PI / 2;
  velo.position.y = -0.071;
  escena.add(velo);
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.ShadowMaterial({ opacity: 0.6 }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -0.0705;
  sombra.receiveShadow = true;
  escena.add(sombra);

  /* Escultura */
  await ceder();
  const materiales = crearMateriales(op.compacto);
  await ceder();
  const { grupo, piezas, lineas } = crearA(materiales);
  const pivote = new THREE.Group();
  pivote.add(grupo);
  escena.add(pivote);

  /* Brillo selectivo: se renderizan solo las luces sobre negro, se difuminan y se suman al final. */
  grupo.traverse((o) => {
    if ((o as THREE.Mesh).material === materiales.luz || (lineas as THREE.Object3D[]).includes(o))
      o.layers.enable(LUZ);
  });
  const capaLuz = new THREE.Layers();
  capaLuz.set(LUZ);
  const negro = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const guardados = new Map<THREE.Object3D, THREE.Material | THREE.Material[] | null>();
  const apagarNoLuces = () => {
    escena.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || capaLuz.test(m.layers)) return;
      guardados.set(m, m.material);
      m.material = negro;
    });
    if (reflejo) reflejo.visible = false;
  };
  const restaurar = () => {
    guardados.forEach((mat, o) => ((o as THREE.Mesh).material = mat as THREE.Material));
    guardados.clear();
    if (reflejo) reflejo.visible = true;
  };
  const composerLuz = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }),
  );
  composerLuz.renderToScreen = false;
  composerLuz.addPass(new RenderPass(escena, camara));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.22, 0);
  composerLuz.addPass(bloom);

  // Imagen final con MSAA 4x. El último pase suma el brillo y conserva la transparencia.
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }),
  );
  composer.addPass(new RenderPass(escena, camara));
  // El tono y el paso a sRGB van en el pase final, sobre el color sin premultiplicar: la curva de
  // AgX levanta el negro, y aplicada a los píxeles transparentes aclaraba todo el lienzo.
  const final = new ShaderPass(
    new THREE.ShaderMaterial({
      name: 'ComponerSobreSitio',
      uniforms: {
        tDiffuse: { value: null },
        tLuz: { value: composerLuz.renderTarget2.texture },
        tiempo: { value: 0 },
        toneMappingExposure: { value: 1.15 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        // ShaderMaterial ya trae AgXToneMapping y sRGBTransferOETF (tonemapping/colorspace pars).
        uniform sampler2D tDiffuse, tLuz;
        uniform float tiempo;
        varying vec2 vUv;
        float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec4 lineal = texture2D(tDiffuse, vUv);
          vec3 color = lineal.a > 0.0001 ? lineal.rgb / lineal.a : vec3(0.0);
          color = sRGBTransferOETF(vec4(AgXToneMapping(color), 1.0)).rgb;
          vec4 base = vec4(color * lineal.a, lineal.a);
          // El brillo está en lineal: se lleva a la pantalla de forma aproximada antes de sumarlo.
          vec3 luz = pow(max(texture2D(tLuz, vUv).rgb, 0.0), vec3(1.0 / 2.2));
          vec3 rgb = base.rgb + luz + (azar(vUv * 1000.0 + tiempo) - 0.5) * 0.02 * base.a;
          // Lienzo premultiplicado: el brillo se suma al color sin tocar la transparencia, así la
          // página recibe luz aditiva (página + brillo) en lugar de quedar tapada por un velo.
          gl_FragColor = vec4(rgb, base.a);
        }`,
    }),
  );
  composer.addPass(final);

  /* Estado y animación */
  const estado = { progreso: 0, px: 0, py: 0, ox: 0, oy: 0 };
  const tmp = new THREE.Vector3();
  const suave = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  let ancho = 1;
  let alto = 1;
  const resolucionMax = Math.min(
    op.compacto ? 1.5 : 2,
    devicePixelRatio < 1.5 ? devicePixelRatio * 1.5 : devicePixelRatio,
  );
  const resolucionMin = Math.min(devicePixelRatio, 1);
  let resolucion = resolucionMax;

  function encuadrar() {
    camara.aspect = ancho / alto;
    camara.fov = camara.aspect < 0.85 ? 34 : 30;
    camara.updateProjectionMatrix();
  }

  function aplicar(t: number) {
    estado.ox += (estado.px - estado.ox) * 0.05;
    estado.oy += (estado.py - estado.oy) * 0.05;
    const p = estado.progreso;
    const respira = op.quieto ? 0 : Math.sin(t * 0.5) * 0.05;
    const despiece = suave(0.12, 0.85, p) * 0.75;
    pivote.rotation.set(
      0.05 + p * 0.12 + estado.oy * 0.05,
      -0.62 + p * 0.85 + respira + estado.ox * 0.14,
      0,
    );
    pivote.position.y = op.quieto ? 0 : Math.sin(t * 0.8) * 0.02 * (1 - despiece);
    for (const pieza of piezas) {
      const pose = pieza.userData['pose'] as Pose;
      tmp.copy(pose.despiece).multiplyScalar(despiece);
      if (pose.capa !== null) tmp.y += pose.capa * 0.18 * despiece;
      pieza.position.copy(pose.reposo).add(tmp);
      pieza.rotation.set(
        pose.rotDespiece.x * despiece,
        pose.rotDespiece.y * despiece,
        pose.rotDespiece.z * despiece,
      );
    }
    // Encuadre que garantiza que la pieza (≈ 3,7 × 3 m) entre entera en cualquier proporción.
    const tg = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const distancia = Math.max(1.75 / tg, 2.05 / (tg * camara.aspect)) + 1.2 + p * 1.4;
    camara.position.set(0, 1.55 + p * 0.4, distancia);
    camara.lookAt(0, 1.08, 0);
    bloom.strength = 0.8 - p * 0.3;
    final.uniforms['tiempo'].value = op.quieto ? 0 : t % 10;
  }

  function medir(w: number, h: number) {
    if (!w || !h) return;
    ancho = w;
    alto = h;
    renderer.setPixelRatio(resolucion);
    composer.setPixelRatio(resolucion);
    composerLuz.setPixelRatio(Math.min(resolucion, 1));
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    composerLuz.setSize(w, h);
    materiales.canto.resolution.set(w * resolucion, h * resolucion);
    encuadrar();
  }

  function dibujar(t: number) {
    aplicar(t);
    apagarNoLuces();
    composerLuz.render();
    restaurar();
    composer.render();
  }

  // Calidad adaptativa: baja la resolución un escalón si 90 cuadros promedian más de 20 ms.
  let acumulado = 0;
  let cuadros = 0;
  let calentando = 90;
  let anterior = performance.now();
  function ajustar(ahora: number) {
    const delta = ahora - anterior;
    anterior = ahora;
    if (calentando > 0 || delta > 250) return void calentando--;
    acumulado += delta;
    if (++cuadros < 90) return;
    const promedio = acumulado / cuadros;
    acumulado = cuadros = 0;
    if (promedio > 20 && resolucion > resolucionMin) {
      resolucion = Math.max(resolucionMin, resolucion - 0.25);
      medir(ancho, alto);
    }
  }

  let pausada = true;
  let pedido = 0;
  function bucle(ahora: number) {
    pedido = requestAnimationFrame(bucle);
    ajustar(ahora);
    dibujar(ahora / 1000);
  }
  // Con movimiento reducido no hay bucle: se dibuja un cuadro cuando cambia algo.
  const redibujar = () => op.quieto && !pausada && dibujar(0);

  const rect = lienzo.getBoundingClientRect();
  medir(rect.width, rect.height);
  aplicar(0);
  // Compila los shaders en paralelo (si el navegador lo permite) antes del primer cuadro visible.
  await ceder();
  await renderer.compileAsync(escena, camara);
  await ceder();

  return {
    progreso(v) {
      estado.progreso = Math.min(1, Math.max(0, v));
      redibujar();
    },
    puntero(x, y) {
      if (op.quieto) return;
      estado.px = x;
      estado.py = y;
    },
    pausar(valor) {
      if (valor === pausada) return;
      pausada = valor;
      cancelAnimationFrame(pedido);
      if (pausada) return;
      if (op.quieto) return void dibujar(0);
      anterior = performance.now();
      pedido = requestAnimationFrame(bucle);
    },
    medir(w, h) {
      medir(w, h);
      redibujar();
    },
    destruir() {
      cancelAnimationFrame(pedido);
      escena.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      Object.values(materiales).forEach((m) =>
        Array.isArray(m) ? m.forEach((t) => t.dispose()) : m.dispose(),
      );
      [entorno, mascara].forEach((t) => t.dispose());
      reflejo?.dispose();
      composer.dispose();
      composerLuz.dispose();
      renderer.dispose();
    },
  };
}

export const ALTO_ESCULTURA = MEDIDAS.alto;
