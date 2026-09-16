import * as THREE from "three";
import { celInstellingen as config } from "./celInstellingen";

// Een lokaal gegenereerd ruisvolume vervangt tientallen hashberekeningen per
// fragment. De GPU filtert het volume; de drie octaven blijven behouden.
export function maakRuisVolume(): THREE.Data3DTexture {
  const data = new Uint8Array(64 * 64 * 64);
  let seed = 731;
  for (let i = 0; i < data.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    data[i] = seed >>> 24;
  }
  const texture = new THREE.Data3DTexture(data, 64, 64, 64);
  texture.format = THREE.RedFormat;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

export const ruisGlsl = `
uniform highp sampler3D uRuis;
float ruis3(vec3 p) { vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return texture(uRuis,(i+f+.5)/64.).r; }
float lagen(vec3 p) { return .57*ruis3(p)+.28*ruis3(p*2.03)+.15*ruis3(p*4.09); }
`;

export interface InstrumentMateriaal {
  materiaal: THREE.MeshStandardMaterial;
  ruis: THREE.Data3DTexture;
  tijd: { value: number };
  deling: { value: number };
  opening: { value: number };
}

export function maakInstrumentMateriaal(kleur: THREE.ColorRepresentation, opties: {
  opacity?: number; emissie?: number; schil?: boolean; kern?: boolean; instanced?: boolean; randlicht?: number;
} = {}): InstrumentMateriaal {
  const tijd = { value: 0 }, deling = { value: 0 }, opening = { value: 0 };
  const ruis = maakRuisVolume();
  const schil = opties.schil ?? false;
  const kern = opties.kern ?? false;
  const materiaal = new THREE.MeshStandardMaterial({
    color: kleur, emissive: kleur, emissiveIntensity: opties.emissie ?? config.materiaal.emissieBasis,
    roughness: schil ? .26 : config.materiaal.ruwheid, metalness: 0,
    opacity: opties.opacity ?? 1, transparent: (opties.opacity ?? 1) < 1,
    depthWrite: (opties.opacity ?? 1) === 1, side: THREE.DoubleSide,
  });
  materiaal.customProgramCacheKey = () => `instrument-${schil}-${kern}-${opties.instanced ?? false}-${opties.randlicht ?? 0}`;
  materiaal.onBeforeCompile = (shader) => {
    shader.uniforms.uRuis = { value: ruis };
    shader.uniforms.uTijd = tijd; shader.uniforms.uDeling = deling; shader.uniforms.uOpening = opening;
    shader.vertexShader = `uniform float uTijd; uniform float uDeling; varying vec3 vInstrument; ${schil ? "attribute float aZijde;" : ""}\n${ruisGlsl}\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
      #include <begin_vertex>
      transformed += normal * (lagen(position * ${schil ? "9." : "45."})-.5) * ${schil ? ".035" : config.materiaal.ruis.toFixed(4)};
      ${schil ? `
        transformed *= 1. + ${config.instrument.adem} * sin(uTijd*.31 + position.y*2.);
        float u = clamp(abs(transformed.x / ${kern ? ".32" : "1.1"}),0.,1.);
        transformed.x = mix(transformed.x,aZijde*(${kern ? config.deling.kernRuimte : config.deling.ruimte}+${kern ? config.deling.kernLengte : config.deling.lengte}*u),uDeling);
        transformed.yz *= mix(1.,${kern ? config.deling.kernRadiaal : config.deling.lengte}*sqrt(u/(1.+u)),uDeling);
      ` : ""}
      ${opties.instanced ? `
        float phase = dot(instanceMatrix[3].xyz,vec3(17.,29.,43.));
        transformed += ${config.instrument.brown} * vec3(sin(uTijd*.43+phase),sin(uTijd*.37+phase*1.3),cos(uTijd*.29+phase));
      ` : ""}
      vInstrument = transformed;
    `);
    shader.fragmentShader = `uniform float uOpening; varying vec3 vInstrument;\n${ruisGlsl}\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <normal_fragment_maps>", `
      #include <normal_fragment_maps>
      float relief = lagen(vInstrument * 95.);
      normal = normalize(normal + .1*vec3(dFdx(relief),dFdy(relief),0.));
    `);
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `
      #include <color_fragment>
      float weefsel = lagen(vInstrument*23.);
      ${schil && !kern ? `
        float macro=1.-smoothstep(.08,.3,length(vViewPosition));
        weefsel=mix(weefsel,.25*lagen(vInstrument*80.)+.75*lagen(vInstrument*500.),macro);
      ` : ""}
      diffuseColor.rgb *= .75 + .45 * weefsel;
      ${schil ? `
        float rand = pow(1.-abs(dot(normalize(vNormal),normalize(vViewPosition))),2.2);
        float venster = smoothstep(.45,.82,normalize(vInstrument).z) * uOpening;
        diffuseColor.a *= ${kern ? "(.18 + 1.7*weefsel*weefsel + rand*.7) * (1.-venster*.65)" : "mix((.1 + rand * 1.8) * (.55+weefsel),2.6,(1.-smoothstep(.08,.3,length(vViewPosition)))*(1.-uOpening)) * (1.-venster*.98)"};
      ` : ""}
    `);
    if (schil || opties.randlicht) shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
      outgoingLight += diffuseColor.rgb * pow(1.-abs(dot(normal,normalize(vViewPosition))),2.) * ${opties.randlicht ?? (kern ? ".7" : ".65")};
      #include <opaque_fragment>
    `);
  };
  return { materiaal, ruis, tijd, deling, opening };
}

// Splitst driehoeken exact op x=0. Beide naden kunnen zonder overspannende
// driehoeken naar hun eigen dochterhelft bewegen, binnen één mesh.
export function maakSchil(straal: number, detail: number, schaal: readonly [number, number, number]): THREE.BufferGeometry {
  const basis = new THREE.IcosahedronGeometry(straal, detail);
  const positie = basis.attributes.position;
  const punten: number[] = [], zijden: number[] = [];
  for (let i = 0; i < positie.count; i += 3) {
    const driehoek = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(positie, i + j));
    for (const zijde of [-1, 1]) {
      const polygon: THREE.Vector3[] = [];
      for (let j = 0; j < 3; j++) {
        const a = driehoek[j], b = driehoek[(j + 1) % 3];
        const binnenA = a.x * zijde >= 0, binnenB = b.x * zijde >= 0;
        if (binnenA) polygon.push(a);
        if (binnenA !== binnenB) polygon.push(a.clone().lerp(b, a.x / (a.x - b.x)));
      }
      for (let j = 1; j < polygon.length - 1; j++) for (const p of [polygon[0], polygon[j], polygon[j + 1]]) {
        punten.push(p.x * schaal[0], p.y * schaal[1], p.z * schaal[2]); zijden.push(zijde);
      }
    }
  }
  basis.dispose();
  const geometrie = new THREE.BufferGeometry();
  geometrie.setAttribute("position", new THREE.Float32BufferAttribute(punten, 3));
  geometrie.setAttribute("aZijde", new THREE.Float32BufferAttribute(zijden, 1));
  // Radiale normalen voorkomen het vlakke facettenpatroon van losse driehoeken.
  geometrie.setAttribute("normal", new THREE.Float32BufferAttribute(punten.map((v, i) => v / (schaal[i % 3] ** 2)), 3));
  geometrie.normalizeNormals();
  return geometrie;
}
