import * as THREE from "three";
import { celInstellingen as config } from "./celInstellingen";

// Procedurele meerlagige ruis: geen textures, externe assets of raymarching.
export const ruisGlsl = `
float hash3(vec3 p) { p = fract(p * .3183099 + vec3(.13,.17,.19)); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float ruis3(vec3 p) {
  vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float lagen(vec3 p) { return .57*ruis3(p)+.28*ruis3(p*2.03)+.15*ruis3(p*4.09); }
`;

export interface InstrumentMateriaal {
  materiaal: THREE.MeshStandardMaterial;
  tijd: { value: number };
  deling: { value: number };
  opening: { value: number };
}

export function maakInstrumentMateriaal(kleur: THREE.ColorRepresentation, opties: {
  opacity?: number; emissie?: number; schil?: boolean; kern?: boolean; instanced?: boolean;
} = {}): InstrumentMateriaal {
  const tijd = { value: 0 }, deling = { value: 0 }, opening = { value: 0 };
  const schil = opties.schil ?? false;
  const kern = opties.kern ?? false;
  const materiaal = new THREE.MeshStandardMaterial({
    color: kleur, emissive: kleur, emissiveIntensity: opties.emissie ?? config.materiaal.emissieBasis,
    roughness: config.materiaal.ruwheid, metalness: 0,
    opacity: opties.opacity ?? 1, transparent: (opties.opacity ?? 1) < 1,
    depthWrite: (opties.opacity ?? 1) === 1, side: THREE.DoubleSide,
  });
  materiaal.customProgramCacheKey = () => `instrument-${schil}-${kern}-${opties.instanced ?? false}`;
  materiaal.onBeforeCompile = (shader) => {
    shader.uniforms.uTijd = tijd; shader.uniforms.uDeling = deling; shader.uniforms.uOpening = opening;
    shader.vertexShader = `uniform float uTijd; uniform float uDeling; varying vec3 vInstrument; ${schil ? "attribute float aZijde;" : ""}\n${ruisGlsl}\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
      #include <begin_vertex>
      transformed += normal * (lagen(position * ${schil ? "9." : "45."})-.5) * ${schil ? ".065" : config.materiaal.ruis.toFixed(4)};
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
      normal = normalize(normal + .22*vec3(dFdx(relief),dFdy(relief),0.));
    `);
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `
      #include <color_fragment>
      float weefsel = lagen(vInstrument*23.);
      diffuseColor.rgb *= .64 + .65 * weefsel;
      ${schil ? `
        float rand = pow(1.-abs(dot(normalize(vNormal),normalize(vViewPosition))),2.2);
        float venster = smoothstep(.45,.82,normalize(vInstrument).z) * uOpening;
        diffuseColor.a *= ${kern ? "(.48 + .35*weefsel) * (1.-venster*.88)" : "(.1 + rand * 1.8) * (1.-venster*.98) * (.55+weefsel)"};
      ` : ""}
    `);
    if (schil) shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
      outgoingLight += diffuseColor.rgb * pow(1.-abs(dot(normal,normalize(vViewPosition))),2.) * ${kern ? ".18" : ".65"};
      #include <opaque_fragment>
    `);
  };
  return { materiaal, tijd, deling, opening };
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
