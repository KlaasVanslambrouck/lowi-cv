"use client";

import { memo, useEffect, useRef, useState, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrganelId } from "@/content/lowiCellContent";
import DnaHelix from "./DnaHelix";
import { celInstellingen as c } from "./celInstellingen";
import { celPalet } from "./celPalet";
import { maakInstrumentMateriaal, maakSchil, type InstrumentMateriaal } from "./celMaterialen";
import type { CelStaat } from "./useCelInterpolatie";
import { vervormDeling } from "./celGeometrie";

export function toeval(i: number): number { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

function maakModel(staat: CelStaat) {
  const groep = new THREE.Group();
  const geometrieen: THREE.BufferGeometry[] = [];
  const materialen: (InstrumentMateriaal & { id: OrganelId; emissie: number })[] = [];
  const organellen: { groep: THREE.Object3D; positie: THREE.Vector3 }[] = [];
  const instanties: { mesh: THREE.InstancedMesh; posities: THREE.Vector3[]; schalen: number[] }[] = [];
  function mat(id: OrganelId, opties: Parameters<typeof maakInstrumentMateriaal>[1] = {}, kleur: THREE.ColorRepresentation = staat.kleuren[id]) {
    const binding = maakInstrumentMateriaal(kleur, opties);
    materialen.push({ ...binding, id, emissie: opties.emissie ?? c.materiaal.emissieBasis });
    return binding.materiaal;
  }
  function mesh(geometrie: THREE.BufferGeometry, materiaal: THREE.Material, parent: THREE.Object3D = groep) {
    geometrieen.push(geometrie); const object = new THREE.Mesh(geometrie, materiaal);
    object.frustumCulled = false; parent.add(object); return object;
  }
  mesh(maakSchil(1, c.instrument.icoDetail, c.instrument.membraanSchaal), mat("membraan", { schil: true, opacity: .36, emissie: .16 }));
  const kernKleur = staat.kleuren.kern.clone().multiplyScalar(.48);
  mesh(maakSchil(.32, 12, [1, 1.06, .95]), mat("kern", { schil: true, kern: true, opacity: .48, emissie: .08 }, kernKleur));
  mesh(maakSchil(.29, 8, [1, 1.06, .95]), mat("kern", { schil: true, kern: true, opacity: .28, emissie: .04 }, kernKleur));

  function wolk(aantal: number, basisStraal: number, blaasjes = false) {
    const geometrie = new THREE.IcosahedronGeometry(basisStraal, 1); geometrieen.push(geometrie);
    const korrelKleur = staat.kleuren.ribosoom.clone().lerp(new THREE.Color(1,1,1),.35).multiplyScalar(.38);
    const materiaal = mat("ribosoom", { instanced: true, emissie: blaasjes ? .22 : .09, opacity: blaasjes ? .6 : 1 }, korrelKleur);
    const object = new THREE.InstancedMesh(geometrie, materiaal, aantal); object.frustumCulled = false;
    groep.add(object);
    const posities: THREE.Vector3[] = [], schalen: number[] = [];
    for (let i = 0; i < aantal; i++) {
      const z = toeval(i * 7 + 1) * 2 - 1, hoek = toeval(i * 7 + 2) * Math.PI * 2;
      const r = .35 + .59 * Math.cbrt(toeval(i * 7 + 3));
      const p = new THREE.Vector3(Math.sqrt(1-z*z)*Math.cos(hoek), Math.sqrt(1-z*z)*Math.sin(hoek), z).multiplyScalar(r);
      if (!blaasjes && i < aantal / 3) p.multiplyScalar(.2).add(new THREE.Vector3(...c.ribosomen.zone));
      posities.push(p); schalen.push(.55 + toeval(i * 7 + 4) * (blaasjes ? 1.6 : 1));
      if (blaasjes && i % 4 === 0) object.setColorAt(i, new THREE.Color(celPalet.karmijn).multiplyScalar(.55));
      else if (blaasjes) object.setColorAt(i, new THREE.Color(1, 1, 1));
    }
    instanties.push({ mesh: object, posities, schalen });
  }
  wolk(c.ribosomen.aantal, c.ribosomen.straal);
  wolk(c.instrument.blaasjes, .018, true);

  const mitoBuiten = mat("mitochondrion", { opacity: c.mitochondrien.opacity, emissie: .06 }, celPalet.weefsel);
  const mitoBinnen = mat("mitochondrion", { emissie: 1.0 });
  for (const [x, y, z, rotatie] of c.mitochondrien.plaatsingen) {
    const mitochondrion = new THREE.Group(); mitochondrion.rotation.z = rotatie;
    const buiten = mesh(new THREE.IcosahedronGeometry(1, 10), mitoBuiten, mitochondrion);
    buiten.scale.set(...c.mitochondrien.schaal);
    for (let i = 0; i < c.mitochondrien.plooien; i++) {
      const px = -c.mitochondrien.plooiBereik + i * 2*c.mitochondrien.plooiBereik/(c.mitochondrien.plooien-1);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(px,-.072,.02), new THREE.Vector3(px+.018,-.034,.065),
        new THREE.Vector3(px-.022,.028,.065), new THREE.Vector3(px,.074,.02),
      ]);
      mesh(new THREE.TubeGeometry(curve, 24, c.mitochondrien.plooiStraal, 5, false), mitoBinnen, mitochondrion);
    }
    groep.add(mitochondrion); organellen.push({ groep: mitochondrion, positie: new THREE.Vector3(x,y,z) });
  }
  const golgi = new THREE.Group(), golgiMat = mat("golgi", { emissie: .13 });
  for (let i = 0; i < c.golgi.schijven; i++) {
    const geo = new THREE.LatheGeometry(c.golgi.profiel.map(([r,y])=>new THREE.Vector2(r,y)), 48);
    const schijf = mesh(geo, golgiMat, golgi);
    schijf.position.y = (i-(c.golgi.schijven-1)/2)*c.golgi.afstand;
    schijf.scale.set(1-i*.035,.45,.67);
  }
  golgi.rotation.set(...c.golgi.rotatie); groep.add(golgi);
  organellen.push({ groep: golgi, positie: new THREE.Vector3(...c.golgi.positie) });
  return { groep, geometrieen, materialen, organellen, instanties };
}

function CelModel({ staat }: { staat: CelStaat }): ReactElement {
  const [model] = useState(()=>maakModel(staat));
  const modelRef = useRef(model);
  const werk = useRef({ punt: new THREE.Vector3(), matrix: new THREE.Matrix4(), vorigeDeling: -1 });
  useEffect(()=>()=>{
    model.geometrieen.forEach(g=>g.dispose());
    model.materialen.forEach(m=>m.materiaal.dispose());
    model.instanties.forEach(i=>i.mesh.dispose());
  },[model]);
  useFrame(({ clock })=>{
    const model = modelRef.current, w = werk.current, deling = staat.intensiteit.celdeling;
    for (const m of model.materialen) {
      m.tijd.value = clock.elapsedTime; m.deling.value = deling; m.opening.value = staat.doorsnede;
      m.materiaal.emissiveIntensity = m.emissie * (.9 + .1*staat.intensiteit[m.id]);
    }
    if (Math.abs(deling-w.vorigeDeling)<c.geometrieDrempel) return;
    w.vorigeDeling = deling;
    for (const organel of model.organellen) {
      w.punt.copy(organel.positie); vervormDeling(w.punt,deling); organel.groep.position.copy(w.punt);
      organel.groep.scale.setScalar(1-c.deling.organelVerkleining*deling);
    }
    for (const wolk of model.instanties) {
      wolk.posities.forEach((p,i)=>{
        w.punt.copy(p); vervormDeling(w.punt,deling);
        const s=wolk.schalen[i]; w.matrix.makeScale(s,s,s).setPosition(w.punt); wolk.mesh.setMatrixAt(i,w.matrix);
      });
      wolk.mesh.instanceMatrix.needsUpdate=true;
    }
  });
  return <group><primitive object={model.groep} dispose={null}/><DnaHelix staat={staat}/></group>;
}
export default memo(CelModel);
